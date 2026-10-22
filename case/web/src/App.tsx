import { BrowserRouter, NavLink, Route, Routes } from "react-router";
import UserSwitcher from "./components/UserSwitcher";
import { CurrentUserProvider } from "./currentUser";
import CheckoutPage from "./pages/CheckoutPage";
import KitchenPage from "./pages/KitchenPage";
import MenuPage from "./pages/MenuPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import RestaurantsPage from "./pages/RestaurantsPage";

export default function App() {
  return (
    <BrowserRouter>
      <CurrentUserProvider>
        <header className="app-header">
          <NavLink to="/" className="brand">
            Forkful
          </NavLink>
          <nav>
            <NavLink to="/" end>
              Restaurants
            </NavLink>
            <NavLink to="/orders">My orders</NavLink>
            <NavLink to="/kitchen">Kitchen</NavLink>
          </nav>
          <UserSwitcher />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<RestaurantsPage />} />
            <Route path="/restaurants/:id" element={<MenuPage />} />
            <Route
              path="/restaurants/:id/checkout"
              element={<CheckoutPage />}
            />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
          </Routes>
        </main>
      </CurrentUserProvider>
    </BrowserRouter>
  );
}
