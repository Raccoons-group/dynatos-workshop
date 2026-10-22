using Forkful.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Forkful.Api.Controllers;

[ApiController]
[Route("api/customers")]
public class CustomersController(ForkfulDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<CustomerDto>> List() =>
        await db.Customers
            .OrderBy(c => c.Name)
            .Select(c => new CustomerDto(c.Id, c.Name, c.Company, c.Address))
            .ToListAsync();
}

public record CustomerDto(int Id, string Name, string Company, string Address);
