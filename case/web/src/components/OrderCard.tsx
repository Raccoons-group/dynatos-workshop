import type { ReactNode } from "react";
import type { Order } from "../api";
import { formatPrice, formatTime, statusLabels } from "../format";

type Props = {
  order: Order;
  title: string;
  children?: ReactNode;
};

export default function OrderCard({ order, title, children }: Props) {
  return (
    <li className="card order">
      <div className="card-head">
        <h3>
          #{order.id} · {title}
        </h3>
        <span className={`status status-${order.status}`}>
          {statusLabels[order.status]}
        </span>
      </div>
      <p className="muted">
        {formatTime(order.placedAt)} · {order.deliveryAddress}
      </p>
      <ul className="lines">
        {order.lines.map((line) => (
          <li key={line.dishId}>
            <span>
              {line.quantity} × {line.name}
            </span>
            <span>{formatPrice(line.unitPrice * line.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="order-total">
        <span>Total</span>
        <strong>{formatPrice(order.total)}</strong>
      </p>
      {children && <div className="actions">{children}</div>}
    </li>
  );
}
