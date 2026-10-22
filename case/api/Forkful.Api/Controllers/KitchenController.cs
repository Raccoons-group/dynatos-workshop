using Forkful.Api.Contracts;
using Forkful.Api.Data;
using Forkful.Api.Models;
using Forkful.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Forkful.Api.Controllers;

[ApiController]
[Route("api/kitchen")]
public class KitchenController(ForkfulDbContext db, OrderService orders) : ControllerBase
{
    [HttpGet("{restaurantId:int}/orders")]
    public async Task<List<OrderDto>> ListOrders(int restaurantId)
    {
        var list = await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Vendor)
            .Include(o => o.Lines)
            .Where(o => o.VendorId == restaurantId)
            .OrderByDescending(o => o.PlacedAt)
            .ToListAsync();
        return list.Select(OrderDto.From).ToList();
    }

    [HttpPost("orders/{id:int}/accept")]
    public Task<ActionResult<OrderDto>> Accept(int id) => Change(() => orders.AcceptAsync(id));

    [HttpPost("orders/{id:int}/reject")]
    public Task<ActionResult<OrderDto>> Reject(int id) => Change(() => orders.RejectAsync(id));

    [HttpPost("orders/{id:int}/advance")]
    public Task<ActionResult<OrderDto>> Advance(int id) => Change(() => orders.AdvanceAsync(id));

    [HttpPut("dishes/{id:int}/sold-out")]
    public async Task<IActionResult> SetSoldOut(int id, SoldOutRequest request)
    {
        var dish = await db.Dishes.FindAsync(id);
        if (dish is null)
            return NotFound();

        dish.SoldOut = request.SoldOut;
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<ActionResult<OrderDto>> Change(Func<Task<Order>> change)
    {
        try
        {
            return OrderDto.From(await change());
        }
        catch (OrderException ex)
        {
            return Problem(ex.Message, statusCode: ex.StatusCode);
        }
    }
}

public record SoldOutRequest(bool SoldOut);
