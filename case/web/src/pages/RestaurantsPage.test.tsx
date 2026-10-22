import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import type { Restaurant } from "../api";
import RestaurantsPage from "./RestaurantsPage";

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Test Trattoria",
    cuisine: "Italian",
    description: "Pizza and pasta",
    isOpen: true,
    opensAt: "11:00",
    closesAt: "22:00",
    minimumOrder: 15,
    deliveryFee: 2.5,
  },
  {
    id: 2,
    name: "Test Teahouse",
    cuisine: "Japanese",
    description: "Bento and sushi",
    isOpen: true,
    opensAt: "11:00",
    closesAt: "21:00",
    minimumOrder: 18,
    deliveryFee: 3.5,
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

test("lists the restaurants the API returns", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(restaurants)),
  );

  render(
    <MemoryRouter>
      <RestaurantsPage />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole("heading", { name: "Test Trattoria" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Test Teahouse" }),
  ).toBeInTheDocument();
});
