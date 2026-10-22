using System.Globalization;
using Forkful.Api.Data;
using Forkful.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Forkful.Api.Controllers;

[ApiController]
[Route("api/restaurants")]
public class RestaurantsController(ForkfulDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<RestaurantDto>> List([FromQuery] string? cuisine)
    {
        var vendors = db.Vendors.AsQueryable();
        if (!string.IsNullOrWhiteSpace(cuisine))
            vendors = vendors.Where(v => v.Cuisine.ToLower() == cuisine.ToLower());

        var list = await vendors.OrderBy(v => v.Name).ToListAsync();
        return list.Select(RestaurantDto.From).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RestaurantDto>> Get(int id)
    {
        var vendor = await db.Vendors.FindAsync(id);
        return vendor is null ? NotFound() : RestaurantDto.From(vendor);
    }
}

public record RestaurantDto(
    int Id,
    string Name,
    string Cuisine,
    string Description,
    bool IsOpen,
    string OpensAt,
    string ClosesAt,
    decimal MinimumOrder,
    decimal DeliveryFee)
{
    public static RestaurantDto From(Vendor vendor) => new(
        vendor.Id,
        vendor.Name,
        vendor.Cuisine,
        vendor.Description,
        vendor.IsOpenNow(),
        vendor.OpensAt.ToString("HH:mm", CultureInfo.InvariantCulture),
        vendor.ClosesAt.ToString("HH:mm", CultureInfo.InvariantCulture),
        vendor.MinimumOrder,
        vendor.DeliveryFee);
}
