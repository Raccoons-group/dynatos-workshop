using Forkful.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Forkful.Api.Data;

public class ForkfulDbContext(DbContextOptions<ForkfulDbContext> options) : DbContext(options)
{
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vendor>()
            .HasMany(v => v.Dishes)
            .WithOne()
            .HasForeignKey(d => d.RestaurantId);

        modelBuilder.Entity<Order>()
            .Property(o => o.Status)
            .HasConversion<string>();
    }
}
