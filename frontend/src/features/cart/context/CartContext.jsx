import { createContext, useContext, useEffect, useState } from "react";
import { getMyCart, cartUnwrap } from "../services/cart.service";
import { normalizeCart } from "../utils/cart.helpers";
import { useAuth } from "../../auth/state/useAuth";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, logout, booting } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  async function loadCart() {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }

    try {
      setLoading(true);
      const res = await getMyCart();
      const data = normalizeCart(cartUnwrap(res));
      setCart(data);
    } catch (e) {
      if (e?.status === 401) logout();
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!booting) loadCart();
  }, [booting, isAuthenticated]);

  useEffect(() => {
    const handler = () => loadCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, loadCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside provider");
  return ctx;
}