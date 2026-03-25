import { useMemo } from "react";
import { useCart } from "../context/useCart.js";
import { getCartCount } from "../utils/cart.helpers";

export function useCartCount() {
    const { cart, loadCart } = useCart();

    const cartCount = useMemo(() => getCartCount(cart), [cart]);

    return {
        cartCount,
        reloadCartCount: loadCart,
    };
}
