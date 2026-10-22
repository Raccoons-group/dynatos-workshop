import { useCallback, useEffect, useState } from "react";
import { api, type Dish, type Order, type OrderStatus } from "../api";
import OrderCard from "../components/OrderCard";
import { useCurrentUser } from "../currentUser";
import { formatPrice } from "../format";

const nextStep: Partial<Record<OrderStatus, string>> = {
  Accepted: "Start preparing",
  Preparing: "Out for delivery",
  OutForDelivery: "Delivered",
};

export default function KitchenPage() {
  const { currentRestaurant } = useCurrentUser();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = currentRestaurant?.id;

  const refresh = useCallback(() => {
    if (restaurantId === undefined) return;
    setError(null);
    api
      .kitchenOrders(restaurantId)
      .then(setOrders, (e: Error) => setError(e.message));
    api.menu(restaurantId).then(setDishes, (e: Error) => setError(e.message));
  }, [restaurantId]);

  useEffect(refresh, [refresh]);

  if (!currentRestaurant)
    return (
      <p className="muted">
        Choose a restaurant under “Acting as” to open its kitchen.
      </p>
    );

  const change = (update: Promise<Order>) => {
    setError(null);
    update.then(
      (updated) =>
        setOrders(
          (current) =>
            current?.map((o) => (o.id === updated.id ? updated : o)) ?? null,
        ),
      (e: Error) => setError(e.message),
    );
  };

  const toggleSoldOut = (dish: Dish) =>
    api.setSoldOut(dish.id, !dish.soldOut).then(
      () =>
        setDishes((current) =>
          current.map((d) =>
            d.id === dish.id ? { ...d, soldOut: !d.soldOut } : d,
          ),
        ),
      (e: Error) => setError(e.message),
    );

  const incoming = orders?.filter((o) => o.status === "Placed") ?? [];
  const inProgress = orders?.filter((o) => nextStep[o.status]) ?? [];
  const done =
    orders?.filter(
      (o) => o.status === "Delivered" || o.status === "Cancelled",
    ) ?? [];

  return (
    <section>
      <div className="page-head">
        <h1>Kitchen · {currentRestaurant.name}</h1>
        <button className="secondary" onClick={refresh}>
          Refresh
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      <h2>Incoming</h2>
      {incoming.length === 0 && <p className="muted">No new orders.</p>}
      <ul className="cards">
        {incoming.map((order) => (
          <OrderCard key={order.id} order={order} title={order.customerName}>
            <button onClick={() => change(api.acceptOrder(order.id))}>
              Accept
            </button>
            <button
              className="secondary"
              onClick={() => change(api.rejectOrder(order.id))}
            >
              Reject
            </button>
          </OrderCard>
        ))}
      </ul>

      <h2>In progress</h2>
      {inProgress.length === 0 && (
        <p className="muted">Nothing on the stove.</p>
      )}
      <ul className="cards">
        {inProgress.map((order) => (
          <OrderCard key={order.id} order={order} title={order.customerName}>
            <button onClick={() => change(api.advanceOrder(order.id))}>
              {nextStep[order.status]}
            </button>
          </OrderCard>
        ))}
      </ul>

      <h2>Dishes</h2>
      <ul className="dishes">
        {dishes.map((dish) => (
          <li key={dish.id} className={dish.soldOut ? "dish sold-out" : "dish"}>
            <div>
              <strong>{dish.name}</strong>
              <p className="muted">{dish.category}</p>
            </div>
            <span className="price">{formatPrice(dish.price)}</span>
            <button className="secondary" onClick={() => toggleSoldOut(dish)}>
              {dish.soldOut ? "Back in stock" : "Mark sold out"}
            </button>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <>
          <h2>Done</h2>
          <ul className="cards">
            {done.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                title={order.customerName}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
