using System.Globalization;
using Forkful.Api.Contracts;
using Forkful.Api.Data;
using Forkful.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Forkful.Api.Services;

public class OrderException(string message, int statusCode = StatusCodes.Status400BadRequest) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public class OrderService(ForkfulDbContext db)
{
    private const decimal FreeDeliveryThreshold = 30m;

    public async Task<Order> PlaceAsync(PlaceOrderRequest request)
    {
        var customer = await db.Customers.FindAsync(request.CustomerId)
            ?? throw new OrderException("Unknown customer.");
        var vendor = await db.Vendors.Include(v => v.Dishes).FirstOrDefaultAsync(v => v.Id == request.RestaurantId)
            ?? throw new OrderException("Unknown restaurant.");

        if (!vendor.IsOpenNow())
            throw new OrderException($"{vendor.Name} is closed right now.");
        if (request.Lines.Count == 0)
            throw new OrderException("The basket is empty.");

        var lines = new List<OrderLine>();
        foreach (var line in request.Lines)
        {
            var dish = vendor.Dishes.FirstOrDefault(d => d.Id == line.DishId)
                ?? throw new OrderException($"Dish {line.DishId} isn't on the menu at {vendor.Name}.");
            if (dish.SoldOut)
                throw new OrderException($"{dish.Name} is sold out.");
            if (line.Quantity < 1)
                throw new OrderException("Each quantity must be at least 1.");

            lines.Add(new OrderLine { DishId = dish.Id, DishName = dish.Name, UnitPrice = dish.Price, Quantity = line.Quantity });
        }

        var subtotal = lines.Sum(l => l.UnitPrice * l.Quantity);
        if (subtotal < vendor.MinimumOrder)
            throw new OrderException(string.Create(CultureInfo.InvariantCulture,
                $"The minimum order at {vendor.Name} is €{vendor.MinimumOrder:0.00}."));

        var order = new Order
        {
            Customer = customer,
            Vendor = vendor,
            DeliveryAddress = request.DeliveryAddress,
            Status = OrderStatus.Placed,
            PlacedAt = DateTime.Now,
            Subtotal = subtotal,
            DeliveryFee = subtotal > FreeDeliveryThreshold ? 0m : vendor.DeliveryFee,
            Lines = lines,
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return order;
    }

    public async Task<Order> CancelAsync(int orderId)
    {
        var order = await LoadAsync(orderId);
        if (order.Status != OrderStatus.Placed)
            throw new OrderException("This order can no longer be cancelled.", StatusCodes.Status409Conflict);

        order.Status = OrderStatus.Cancelled;
        await db.SaveChangesAsync();
        return order;
    }

    public async Task<Order> AcceptAsync(int orderId)
    {
        var order = await LoadAsync(orderId);
        if (order.Status != OrderStatus.Placed)
            throw new OrderException("Only new orders can be accepted.", StatusCodes.Status409Conflict);

        order.Status = OrderStatus.Accepted;
        await db.SaveChangesAsync();
        return order;
    }

    public async Task<Order> RejectAsync(int orderId)
    {
        var order = await LoadAsync(orderId);
        if (order.Status != OrderStatus.Placed)
            throw new OrderException("Only new orders can be rejected.", StatusCodes.Status409Conflict);

        order.Status = OrderStatus.Cancelled;
        await db.SaveChangesAsync();
        return order;
    }

    public async Task<Order> AdvanceAsync(int orderId)
    {
        var order = await LoadAsync(orderId);
        order.Status = order.Status switch
        {
            OrderStatus.Accepted => OrderStatus.Preparing,
            OrderStatus.Preparing => OrderStatus.OutForDelivery,
            OrderStatus.OutForDelivery => OrderStatus.Delivered,
            _ => throw new OrderException($"An order that is {order.Status} can't move on.", StatusCodes.Status409Conflict),
        };
        await db.SaveChangesAsync();
        return order;
    }

    private async Task<Order> LoadAsync(int orderId) =>
        await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Vendor)
            .Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.Id == orderId)
        ?? throw new OrderException("Order not found.", StatusCodes.Status404NotFound);
}
