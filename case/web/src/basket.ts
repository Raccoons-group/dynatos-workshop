import { useState } from "react";
import type { Dish } from "./api";

export type BasketLine = {
  dishId: number;
  name: string;
  price: number;
  quantity: number;
};

// One basket per restaurant, kept in the browser.
const storageKey = (restaurantId: number) => `forkful.basket.${restaurantId}`;

function load(restaurantId: number): BasketLine[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(restaurantId)) ?? "[]");
  } catch {
    return [];
  }
}

export function useBasket(restaurantId: number) {
  const [basket, setBasket] = useState(() => ({
    restaurantId,
    lines: load(restaurantId),
  }));
  const lines =
    basket.restaurantId === restaurantId ? basket.lines : load(restaurantId);

  const save = (next: BasketLine[]) => {
    localStorage.setItem(storageKey(restaurantId), JSON.stringify(next));
    setBasket({ restaurantId, lines: next });
  };

  const add = (dish: Dish) =>
    save(
      lines.some((l) => l.dishId === dish.id)
        ? lines.map((l) =>
            l.dishId === dish.id ? { ...l, quantity: l.quantity + 1 } : l,
          )
        : [
            ...lines,
            {
              dishId: dish.id,
              name: dish.name,
              price: dish.price,
              quantity: 1,
            },
          ],
    );

  const remove = (dishId: number) =>
    save(
      lines.flatMap((l) =>
        l.dishId !== dishId
          ? [l]
          : l.quantity > 1
            ? [{ ...l, quantity: l.quantity - 1 }]
            : [],
      ),
    );

  const clear = () => save([]);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return { lines, add, remove, clear, subtotal };
}
