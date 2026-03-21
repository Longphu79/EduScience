import { useCart } from "../context/CartContext";

export function useCartCount() {
  const { cartCount, loadCart } = useCart();

  return {
    cartCount,
    reloadCartCount: loadCart,
  };
}