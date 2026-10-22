namespace Forkful.Api.Models;

public class Vendor
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Cuisine { get; set; }
    public string Description { get; set; } = "";
    public TimeOnly OpensAt { get; set; }
    public TimeOnly ClosesAt { get; set; }
    public decimal MinimumOrder { get; set; }
    public decimal DeliveryFee { get; set; }
    public List<Dish> Dishes { get; set; } = [];

    public bool IsOpenNow()
    {
        var now = TimeOnly.FromDateTime(DateTime.Now);
        return now >= OpensAt && now < ClosesAt;
    }
}
