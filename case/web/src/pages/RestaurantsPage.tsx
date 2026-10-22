import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api, type Restaurant } from "../api";
import { formatPrice } from "../format";

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cuisine = searchParams.get("cuisine") ?? "";
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.restaurants().then(
      (all) => setCuisines([...new Set(all.map((r) => r.cuisine))].sort()),
      () => setCuisines([]),
    );
  }, []);

  useEffect(() => {
    let current = true;
    api.restaurants(cuisine || undefined).then(
      (list) => current && setRestaurants(list),
      (e: Error) => current && setError(e.message),
    );
    return () => {
      current = false;
    };
  }, [cuisine]);

  return (
    <section>
      <h1>Restaurants</h1>
      <div className="chips" role="group" aria-label="Cuisine">
        <button
          className={cuisine === "" ? "chip active" : "chip"}
          onClick={() => setSearchParams({})}
        >
          All
        </button>
        {cuisines.map((c) => (
          <button
            key={c}
            className={cuisine === c ? "chip active" : "chip"}
            onClick={() => setSearchParams({ cuisine: c })}
          >
            {c}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      {restaurants === null ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul className="cards">
          {restaurants.map((r) => (
            <li key={r.id} className="card">
              <Link to={`/restaurants/${r.id}`} className="card-link">
                <div className="card-head">
                  <h2>{r.name}</h2>
                  <span className={r.isOpen ? "badge open" : "badge closed"}>
                    {r.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <p className="muted">
                  {r.cuisine} · {r.opensAt}–{r.closesAt}
                </p>
                <p>{r.description}</p>
                <p className="muted">
                  Delivery {formatPrice(r.deliveryFee)} · Minimum{" "}
                  {formatPrice(r.minimumOrder)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
