using System.Text.Json.Serialization;
using Forkful.Api.Data;
using Forkful.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddDbContext<ForkfulDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Forkful")));
builder.Services.AddScoped<OrderService>();

var app = builder.Build();

// Every start begins from a fresh database with the seed data in it.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ForkfulDbContext>();
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();
    SeedData.Fill(db);
}

app.MapOpenApi();
app.MapControllers();

app.Run();
