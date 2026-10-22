namespace Forkful.Api.Models;

public class Dish
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public required string Name { get; set; }
    public string Description { get; set; } = "";
    public required string Category { get; set; }
    public decimal Price { get; set; }
    public bool SoldOut { get; set; }
}
