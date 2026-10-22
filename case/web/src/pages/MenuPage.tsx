import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api, type Dish, type Restaurant } from "../api";
import { useBasket } from "../basket";
import { formatPrice } from "../format";

export default function MenuPage() {
  const restaurantId = Number(useParams().id);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const basket = useBasket(restaurantId);

  useEffect(() => {
    api
      .restaurant(restaurantId)
      .then(setRestaurant, (e: Error) => setError(e.message));
    api.menu(restaurantId).then(setDishes, (e: Error) => setError(e.message));
  }, [restaurantId]);

  const categories = [...new Set(dishes?.map((d) => d.category))];

  return (
    <div className="menu-layout">
      <section>
        <Link to="/" className="back">
          ← All restaurants
        </Link>
        <h1>{restaurant?.name ?? "Menu"}</h1>
        {restaurant && (
          <p className="muted">
            {restaurant.cuisine} · {restaurant.description}
          </p>
        )}
        {error && <p className="error">{error}</p>}
        {dishes === null && !error && <p className="muted">Loading…</p>}
        {categories.map((category) => (
          <div key={category}>
            <h2>{category}</h2>
            <ul className="dishes">
              {dishes
                ?.filter((d) => d.category === category)
                .map((dish) => (
                  <li
                    key={dish.id}
                    className={dish.soldOut ? "dish sold-out" : "dish"}
                  >
                    <div>
                      <strong>{dish.name}</strong>
                      {dish.description && (
                        <p className="muted">{dish.description}</p>
                      )}
                    </div>
                    <span className="price">{formatPrice(dish.price)}</span>
                    <button
                      disabled={dish.soldOut}
                      onClick={() => basket.add(dish)}
                    >
                      {dish.soldOut ? "Sold out" : "Add"}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <aside className="basket">
        <h2>Your basket</h2>
        {basket.lines.length === 0 ? (
          <p className="muted">Nothing in it yet.</p>
        ) : (
          <>
            <ul className="lines">
              {basket.lines.map((line) => (
                <li key={line.dishId}>
                  <span>
                    {line.quantity} × {line.name}
                  </span>
                  <span>{formatPrice(line.price * line.quantity)}</span>
                  <button
                    className="small"
                    aria-label={`Remove one ${line.name}`}
                    onClick={() => basket.remove(line.dishId)}
                  >
                    −
                  </button>
                </li>
              ))}
            </ul>
            <p className="subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(basket.subtotal)}</strong>
            </p>
            <Link
              className="button"
              to={`/restaurants/${restaurantId}/checkout`}
            >
              Go to checkout
            </Link>
          </>
        )}
      </aside>
    </div>
  );
}
