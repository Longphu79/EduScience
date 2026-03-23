import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMyCart, cartUnwrap } from "../services/cart.service";
import { normalizeCart, getCartCount } from "../utils/cart.helpers";
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
    if (!booting) {
      loadCart();
    }
  }, [booting, isAuthenticated]);

  useEffect(() => {
    if (booting) return;

    const handler = () => {
      loadCart();
    };

    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [booting, isAuthenticated]);

  const value = useMemo(
    () => ({
      cart,
      setCart,
      loadCart,
      loading,
      cartCount: getCartCount(cart),
    }),
    [cart, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside provider");
  return ctx;
}