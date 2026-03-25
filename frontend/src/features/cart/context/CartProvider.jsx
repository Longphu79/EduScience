import { useEffect, useMemo, useState, useCallback } from "react";
import { getMyCart, cartUnwrap } from "../services/cart.service";
import { normalizeCart, getCartCount } from "../utils/cart.helpers";
import { useAuth } from "../../auth/state/useAuth";
import { CartContext } from "./CartContext"; // Import từ file mới tách

export function CartProvider({ children }) {
    const { isAuthenticated, logout, booting } = useAuth();
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);

    const loadCart = useCallback(async () => {
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
    }, [isAuthenticated, logout]);

    useEffect(() => {
        if (!booting) loadCart();
    }, [booting, loadCart]);

    useEffect(() => {
        if (booting) return;
        const handler = () => loadCart();
        window.addEventListener("cart-updated", handler);
        return () => window.removeEventListener("cart-updated", handler);
    }, [booting, loadCart]);

    const value = useMemo(
        () => ({
            cart,
            setCart,
            loadCart,
            loading,
            cartCount: getCartCount(cart),
        }),
        [cart, loading, loadCart],
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}
