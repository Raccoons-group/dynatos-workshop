using Forkful.Api.Models;

namespace Forkful.Api.Data;

public static class SeedData
{
    public static void Fill(ForkfulDbContext db)
    {
        var dishes = MenuSeed.Dishes();

        db.Vendors.AddRange(Restaurants());
        db.Dishes.AddRange(dishes);
        db.Customers.AddRange(Customers());
        db.SaveChanges();

        db.Orders.AddRange(Orders(dishes));
        db.SaveChanges();
    }

    private static Vendor[] Restaurants() =>
    [
        new()
        {
            Id = 1, Name = "Night Owl Noodles", Cuisine = "Vietnamese",
            Description = "Pho and rice dishes, around the clock",
            OpensAt = new(0, 0), ClosesAt = new(23, 59), MinimumOrder = 12m, DeliveryFee = 2.95m,
        },
        new()
        {
            Id = 2, Name = "Trattoria Sole", Cuisine = "Italian",
            Description = "Wood-fired pizza and fresh pasta",
            OpensAt = new(8, 30), ClosesAt = new(22, 0), MinimumOrder = 15m, DeliveryFee = 2.50m,
        },
        new()
        {
            Id = 3, Name = "Sakura Bento", Cuisine = "Japanese",
            Description = "Bento boxes, sushi and ramen",
            OpensAt = new(8, 0), ClosesAt = new(21, 0), MinimumOrder = 18m, DeliveryFee = 3.50m,
        },
        new()
        {
            Id = 4, Name = "Masala House", Cuisine = "Indian",
            Description = "Curries from the north and the south",
            OpensAt = new(8, 0), ClosesAt = new(22, 30), MinimumOrder = 20m, DeliveryFee = 3.00m,
        },
        new()
        {
            Id = 5, Name = "Green Bowl", Cuisine = "Healthy",
            Description = "Bowls, salads and wraps",
            OpensAt = new(7, 0), ClosesAt = new(20, 0), MinimumOrder = 10m, DeliveryFee = 1.95m,
        },
        new()
        {
            Id = 6, Name = "Bistro Lune", Cuisine = "French",
            Description = "French classics for dinner",
            OpensAt = new(17, 30), ClosesAt = new(23, 0), MinimumOrder = 25m, DeliveryFee = 4.50m,
        },
    ];

    private static Customer[] Customers() =>
    [
        new() { Id = 1, Name = "Anna de Vries", Company = "Hartman Logistics", Address = "Havenkade 4" },
        new() { Id = 2, Name = "Tom Jacobs", Company = "Hartman Logistics", Address = "Havenkade 4" },
        new() { Id = 3, Name = "Priya Sharma", Company = "Hartman Logistics", Address = "Havenkade 4" },
        new() { Id = 4, Name = "Lars Peeters", Company = "Pixel & Pine", Address = "Marktstraat 21" },
        new() { Id = 5, Name = "Sofia Rossi", Company = "Pixel & Pine", Address = "Marktstraat 21" },
        new() { Id = 6, Name = "Daan Willems", Company = "Pixel & Pine", Address = "Marktstraat 21" },
        new() { Id = 7, Name = "Mia Janssen", Company = "Vosberg Accountants", Address = "Parklaan 88" },
        new() { Id = 8, Name = "Youssef El Amrani", Company = "Vosberg Accountants", Address = "Parklaan 88" },
    ];

    private static Order[] Orders(List<Dish> dishes)
    {
        var today = DateTime.Today;
        var now = DateTime.Now;

        Order NewOrder(int customerId, int restaurantId, string address, OrderStatus status, DateTime placedAt,
            decimal deliveryFee, params (int DishId, int Quantity)[] lines)
        {
            var orderLines = lines.Select(line =>
            {
                var dish = dishes.Single(d => d.Id == line.DishId);
                return new OrderLine { DishId = dish.Id, DishName = dish.Name, UnitPrice = dish.Price, Quantity = line.Quantity };
            }).ToList();

            return new Order
            {
                CustomerId = customerId,
                VendorId = restaurantId,
                DeliveryAddress = address,
                Status = status,
                PlacedAt = placedAt,
                Subtotal = orderLines.Sum(l => l.UnitPrice * l.Quantity),
                DeliveryFee = deliveryFee,
                Lines = orderLines,
            };
        }

        return
        [
            NewOrder(1, 2, "Havenkade 4", OrderStatus.Delivered, today.AddDays(-3).AddHours(12).AddMinutes(10), 2.50m, (11, 1), (19, 1)),
            NewOrder(4, 4, "Marktstraat 21", OrderStatus.Delivered, today.AddDays(-2).AddHours(12).AddMinutes(25), 0m, (31, 2), (38, 2), (39, 1)),
            NewOrder(7, 3, "Parklaan 88", OrderStatus.Delivered, today.AddDays(-1).AddHours(11).AddMinutes(50), 3.50m, (22, 1), (30, 1)),
            NewOrder(2, 5, "Havenkade 4", OrderStatus.Cancelled, today.AddDays(-1).AddHours(12).AddMinutes(5), 1.95m, (41, 1)),
            NewOrder(5, 2, "Marktstraat 21", OrderStatus.Preparing, now.AddMinutes(-20), 2.50m, (12, 1), (15, 1)),
            NewOrder(8, 4, "Parklaan 88", OrderStatus.Accepted, now.AddMinutes(-10), 3.00m, (36, 1), (40, 1)),
            NewOrder(3, 1, "Havenkade 4", OrderStatus.Placed, now.AddMinutes(-4), 2.95m, (2, 1), (7, 1)),
        ];
    }
}
