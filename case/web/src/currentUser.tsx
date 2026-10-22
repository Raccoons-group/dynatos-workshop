import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, request, type Restaurant } from "./api";

export type User = {
  id: number;
  name: string;
  company: string;
  address: string;
};

export type ActingAs = { kind: "user" | "restaurant"; id: number };

type CurrentUserContextValue = {
  users: User[];
  restaurants: Restaurant[];
  currentUser: User | null;
  currentRestaurant: Restaurant | null;
  switchTo: (actingAs: ActingAs) => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const storageKey = "forkful.actingAs";

function loadActingAs(): ActingAs {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "");
  } catch {
    return { kind: "user", id: 1 };
  }
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [actingAs, setActingAs] = useState(loadActingAs);

  useEffect(() => {
    request<User[]>("/api/customers").then(setUsers, () => setUsers([]));
    api.restaurants().then(setRestaurants, () => setRestaurants([]));
  }, []);

  const switchTo = (next: ActingAs) => {
    localStorage.setItem(storageKey, JSON.stringify(next));
    setActingAs(next);
  };

  const currentUser =
    actingAs.kind === "user"
      ? (users.find((u) => u.id === actingAs.id) ?? null)
      : null;
  const currentRestaurant =
    actingAs.kind === "restaurant"
      ? (restaurants.find((r) => r.id === actingAs.id) ?? null)
      : null;

  return (
    <CurrentUserContext
      value={{ users, restaurants, currentUser, currentRestaurant, switchTo }}
    >
      {children}
    </CurrentUserContext>
  );
}

export function useCurrentUser() {
  const value = useContext(CurrentUserContext);
  if (!value)
    throw new Error("useCurrentUser needs a CurrentUserProvider around it");
  return value;
}
