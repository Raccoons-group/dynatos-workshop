import type { OrderStatus } from "./api";

const euros = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export const formatPrice = (amount: number) => euros.format(amount);

// The API sends local time without an offset.
export const formatTime = (timestamp: string) =>
  new Date(timestamp.slice(0, 19)).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const statusLabels: Record<OrderStatus, string> = {
  Placed: "Placed",
  Accepted: "Accepted",
  Preparing: "Preparing",
  OutForDelivery: "Out for delivery",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};
