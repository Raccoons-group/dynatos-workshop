import { useEffect, useState } from "react";
import { api, type Order } from "../api";
import OrderCard from "../components/OrderCard";
import { useCurrentUser } from "../currentUser";

export default function MyOrdersPage() {
  const { currentUser } = useCurrentUser();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    api
      .orders(currentUser.id)
      .then(setOrders, (e: Error) => setError(e.message));
  }, [currentUser]);

  if (!currentUser)
    return (
      <p className="muted">
        Choose a customer under “Acting as” to see their orders.
      </p>
    );

  const cancel = (id: number) => {
    setError(null);
    api.cancelOrder(id).then(
      (updated) =>
        setOrders(
          (current) =>
            current?.map((o) => (o.id === updated.id ? updated : o)) ?? null,
        ),
      (e: Error) => setError(e.message),
    );
  };

  return (
    <section>
      <h1>My orders</h1>
      <p className="muted">
        {currentUser.name} · {currentUser.company}
      </p>
      {error && <p className="error">{error}</p>}
      {orders === null ? (
        <p className="muted">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <ul className="cards">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              title={order.restaurantName}
            >
              {order.status !== "Delivered" && order.status !== "Cancelled" && (
                <button className="secondary" onClick={() => cancel(order.id)}>
                  Cancel order
                </button>
              )}
            </OrderCard>
          ))}
        </ul>
      )}
    </section>
  );
}
