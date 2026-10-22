using Forkful.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Forkful.Api.Controllers;

[ApiController]
[Route("api/restaurants/{restaurantId:int}/menu")]
public class MenuController(ForkfulDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<DishDto>> Get(int restaurantId) =>
        await db.Dishes
            .Where(d => d.RestaurantId == restaurantId)
            .OrderBy(d => d.Id)
            .Select(d => new DishDto(d.Id, d.RestaurantId, d.Name, d.Description, d.Category, d.Price, d.SoldOut))
            .ToListAsync();
}

public record DishDto(int Id, int RestaurantId, string Name, string Description, string Category, decimal Price, bool SoldOut);
