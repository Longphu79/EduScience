import { createContext, useContext, useEffect, useState } from "react";
import { getMyCart } from "../services/cart.service";
import { useAuth } from "../../auth/state/useAuth";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!isAuthenticated || !token) {
        setCart({ items: [] });
        return;
      }

      setLoading(true);

      const response = await getMyCart();
      const payload = response?.data || response || { items: [] };

      setCart({
        items: Array.isArray(payload?.items) ? payload.items : [],
        ...payload,
      });
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 401) {
        localStorage.removeItem("token");
        setCart({ items: [] });
        return;
      }

      console.error("Load cart error:", message || error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        loading,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}