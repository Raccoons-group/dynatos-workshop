using System.Net.Http.Json;
using Forkful.Api.Controllers;

namespace Forkful.Api.Tests;

public class RestaurantsTests(ForkfulApiFactory factory) : IClassFixture<ForkfulApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Listing_restaurants_returns_the_seed_data()
    {
        var restaurants = await _client.GetFromJsonAsync<List<RestaurantDto>>("/api/restaurants");

        Assert.NotNull(restaurants);
        Assert.Equal(6, restaurants.Count);
        Assert.Contains(restaurants, r => r.Name == "Trattoria Sole" && r.Cuisine == "Italian");
    }

    [Fact]
    public async Task A_restaurants_menu_returns_its_dishes()
    {
        var dishes = await _client.GetFromJsonAsync<List<DishDto>>("/api/restaurants/2/menu");

        Assert.NotNull(dishes);
        Assert.Equal(10, dishes.Count);
        Assert.All(dishes, d => Assert.Equal(2, d.RestaurantId));
        Assert.Contains(dishes, d => d.Name == "Margherita" && d.Category == "Pizza");
    }
}
