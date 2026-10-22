namespace Forkful.Api.Models;

public enum OrderStatus
{
    Placed,
    Accepted,
    Preparing,
    OutForDelivery,
    Delivered,
    Cancelled,
}

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public required string DeliveryAddress { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime PlacedAt { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public List<OrderLine> Lines { get; set; } = [];
}

public class OrderLine
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int DishId { get; set; }
    public required string DishName { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}
