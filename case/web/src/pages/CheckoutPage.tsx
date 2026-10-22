import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, type Restaurant } from "../api";
import { useBasket } from "../basket";
import BasketSummary from "../components/BasketSummary";
import { useCurrentUser } from "../currentUser";
import { formatPrice } from "../format";

export default function CheckoutPage() {
  const restaurantId = Number(useParams().id);
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const basket = useBasket(restaurantId);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api
      .restaurant(restaurantId)
      .then(setRestaurant, (e: Error) => setError(e.message));
  }, [restaurantId]);

  useEffect(() => {
    if (currentUser) setAddress(currentUser.address);
  }, [currentUser]);

  if (!currentUser)
    return (
      <p className="muted">Choose a customer under “Acting as” to check out.</p>
    );
  if (!restaurant)
    return <p className={error ? "error" : "muted"}>{error ?? "Loading…"}</p>;

  const belowMinimum = basket.subtotal < restaurant.minimumOrder;

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError(null);
    try {
      await api.placeOrder({
        customerId: currentUser.id,
        restaurantId,
        deliveryAddress: address,
        lines: basket.lines.map((l) => ({
          dishId: l.dishId,
          quantity: l.quantity,
        })),
      });
      basket.clear();
      navigate("/orders");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="checkout">
      <Link to={`/restaurants/${restaurantId}`} className="back">
        ← Back to the menu
      </Link>
      <h1>Checkout</h1>
      <p className="muted">{restaurant.name} · you pay on delivery</p>
      {basket.lines.length === 0 ? (
        <p>Your basket is empty.</p>
      ) : (
        <form onSubmit={placeOrder}>
          <ul className="lines">
            {basket.lines.map((l) => (
              <li key={l.dishId}>
                <span>
                  {l.quantity} × {l.name}
                </span>
                <span>{formatPrice(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <BasketSummary
            subtotal={basket.subtotal}
            deliveryFee={restaurant.deliveryFee}
          />
          <label>
            Delivery address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>
          {belowMinimum && (
            <p className="warning">
              The minimum order at {restaurant.name} is{" "}
              {formatPrice(restaurant.minimumOrder)}. Add{" "}
              {formatPrice(restaurant.minimumOrder - basket.subtotal)} more.
            </p>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={belowMinimum || placing}>
            {placing ? "Placing…" : "Place order"}
          </button>
        </form>
      )}
    </section>
  );
}
