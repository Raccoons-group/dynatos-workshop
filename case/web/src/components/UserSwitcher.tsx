import { useLocation, useNavigate } from "react-router";
import { useCurrentUser, type ActingAs } from "../currentUser";

export default function UserSwitcher() {
  const { users, restaurants, currentUser, currentRestaurant, switchTo } =
    useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const value = currentUser
    ? `user:${currentUser.id}`
    : currentRestaurant
      ? `restaurant:${currentRestaurant.id}`
      : "";

  const onChange = (selected: string) => {
    const [kind, id] = selected.split(":");
    switchTo({ kind: kind as ActingAs["kind"], id: Number(id) });
    if (kind === "restaurant") navigate("/kitchen");
    else if (location.pathname === "/kitchen") navigate("/");
  };

  return (
    <label className="user-switcher">
      Acting as
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {value === "" && <option value="">Choose…</option>}
        <optgroup label="Customers">
          {users.map((u) => (
            <option key={u.id} value={`user:${u.id}`}>
              {u.name} ({u.company})
            </option>
          ))}
        </optgroup>
        <optgroup label="Restaurants">
          {restaurants.map((r) => (
            <option key={r.id} value={`restaurant:${r.id}`}>
              {r.name}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
