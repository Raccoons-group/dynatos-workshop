import { formatPrice } from "../format";

type Props = {
  subtotal: number;
  deliveryFee: number;
};

export default function BasketSummary({ subtotal, deliveryFee }: Props) {
  const delivery = subtotal > 30 ? 0 : deliveryFee;

  return (
    <dl className="summary">
      <dt>Subtotal</dt>
      <dd>{formatPrice(subtotal)}</dd>
      <dt>Delivery</dt>
      <dd>{delivery === 0 ? "Free" : formatPrice(delivery)}</dd>
      <dt className="total">Total</dt>
      <dd className="total">{formatPrice(subtotal + delivery)}</dd>
    </dl>
  );
}
