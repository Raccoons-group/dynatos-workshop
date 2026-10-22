namespace Forkful.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Company { get; set; }
    public required string Address { get; set; }
}
