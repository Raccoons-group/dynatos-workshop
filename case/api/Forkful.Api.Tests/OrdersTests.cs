using System.Net;
using System.Net.Http.Json;
using Forkful.Api.Contracts;

namespace Forkful.Api.Tests;

public class OrdersTests(ForkfulApiFactory factory) : IClassFixture<ForkfulApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Placing_a_valid_order_returns_201()
    {
        var request = new PlaceOrderRequest(
            CustomerId: 1,
            RestaurantId: 1,
            DeliveryAddress: "Havenkade 4",
            Lines: [new PlaceOrderLine(DishId: 1, Quantity: 2), new PlaceOrderLine(DishId: 2, Quantity: 1)]);

        var response = await _client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
    }
}
