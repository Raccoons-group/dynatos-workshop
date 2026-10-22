using Forkful.Api.Contracts;
using Forkful.Api.Data;
using Forkful.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Forkful.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(ForkfulDbContext db, OrderService orders) : ControllerBase
{
    [HttpGet]
    public async Task<List<OrderDto>> List([FromQuery] int customerId)
    {
        var list = await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Vendor)
            .Include(o => o.Lines)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.PlacedAt)
            .ToListAsync();
        return list.Select(OrderDto.From).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> Get(int id)
    {
        var order = await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Vendor)
            .Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.Id == id);
        return order is null ? NotFound() : OrderDto.From(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Place(PlaceOrderRequest request)
    {
        try
        {
            var order = await orders.PlaceAsync(request);
            return CreatedAtAction(nameof(Get), new { id = order.Id }, OrderDto.From(order));
        }
        catch (OrderException ex)
        {
            return Problem(ex.Message, statusCode: ex.StatusCode);
        }
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<OrderDto>> Cancel(int id)
    {
        try
        {
            return OrderDto.From(await orders.CancelAsync(id));
        }
        catch (OrderException ex)
        {
            return Problem(ex.Message, statusCode: ex.StatusCode);
        }
    }
}
