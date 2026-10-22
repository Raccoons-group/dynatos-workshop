using Forkful.Api.Models;

namespace Forkful.Api.Contracts;

public record PlaceOrderRequest(int CustomerId, int RestaurantId, string DeliveryAddress, List<PlaceOrderLine> Lines);

public record PlaceOrderLine(int DishId, int Quantity);

public record OrderLineDto(int DishId, string Name, decimal UnitPrice, int Quantity);

public record OrderDto(
    int Id,
    int CustomerId,
    string CustomerName,
    int RestaurantId,
    string RestaurantName,
    string DeliveryAddress,
    OrderStatus Status,
    DateTime PlacedAt,
    List<OrderLineDto> Lines,
    decimal Subtotal,
    decimal DeliveryFee,
    decimal Total)
{
    public static OrderDto From(Order order) => new(
        order.Id,
        order.CustomerId,
        order.Customer.Name,
        order.VendorId,
        order.Vendor.Name,
        order.DeliveryAddress,
        order.Status,
        order.PlacedAt,
        order.Lines.Select(l => new OrderLineDto(l.DishId, l.DishName, l.UnitPrice, l.Quantity)).ToList(),
        order.Subtotal,
        order.DeliveryFee,
        order.Subtotal + order.DeliveryFee);
}
