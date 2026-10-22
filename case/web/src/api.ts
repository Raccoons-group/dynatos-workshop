export type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
  minimumOrder: number;
  deliveryFee: number;
};

export type Dish = {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  category: string;
  price: number;
  soldOut: boolean;
};

export type OrderStatus =
  | "Placed"
  | "Accepted"
  | "Preparing"
  | "OutForDelivery"
  | "Delivered"
  | "Cancelled";

export type OrderLine = {
  dishId: number;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: number;
  customerId: number;
  customerName: string;
  restaurantId: number;
  restaurantName: string;
  deliveryAddress: string;
  status: OrderStatus;
  placedAt: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type NewOrder = {
  customerId: number;
  restaurantId: number;
  deliveryAddress: string;
  lines: { dishId: number; quantity: number }[];
};

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ??
        problem?.title ??
        `Request failed with ${response.status}`,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const api = {
  restaurants: (cuisine?: string) =>
    request<Restaurant[]>(
      cuisine
        ? `/api/restaurants?cuisine=${encodeURIComponent(cuisine)}`
        : "/api/restaurants",
    ),
  restaurant: (id: number) => request<Restaurant>(`/api/restaurants/${id}`),
  menu: (restaurantId: number) =>
    request<Dish[]>(`/api/restaurants/${restaurantId}/menu`),
  orders: (customerId: number) =>
    request<Order[]>(`/api/orders?customerId=${customerId}`),
  placeOrder: (order: NewOrder) => post<Order>("/api/orders", order),
  cancelOrder: (id: number) => post<Order>(`/api/orders/${id}/cancel`),
  kitchenOrders: (restaurantId: number) =>
    request<Order[]>(`/api/kitchen/${restaurantId}/orders`),
  acceptOrder: (id: number) => post<Order>(`/api/kitchen/orders/${id}/accept`),
  rejectOrder: (id: number) => post<Order>(`/api/kitchen/orders/${id}/reject`),
  advanceOrder: (id: number) =>
    post<Order>(`/api/kitchen/orders/${id}/advance`),
  setSoldOut: (dishId: number, soldOut: boolean) =>
    request<void>(`/api/kitchen/dishes/${dishId}/sold-out`, {
      method: "PUT",
      body: JSON.stringify({ soldOut }),
    }),
};
