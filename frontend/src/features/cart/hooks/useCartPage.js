import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import {
    cartUnwrap,
    updateCartItemQuantity,
    removeCartItem,
    checkoutCart,
} from "../services/cart.service";
import {
    getCartItems,
    getCartSubtotal,
    getCartTotalItems,
    normalizeCart,
} from "../utils/cart.helpers";

export default function useCartPage() {
    const navigate = useNavigate();
    const { cart, setCart } = useCart();

    const [processing, setProcessing] = useState([]);
    const [checkingOut, setCheckingOut] = useState(false);
    const [toast, setToast] = useState(null);

    const items = useMemo(() => getCartItems(cart), [cart]);
    const totalItems = useMemo(() => getCartTotalItems(cart), [cart]);
    const subtotal = useMemo(() => getCartSubtotal(cart), [cart]);

    function start(id) {
        setProcessing((p) => [...new Set([...p, id])]);
    }

    function stop(id) {
        setProcessing((p) => p.filter((i) => i !== id));
    }

    async function increase(id, qty) {
        try {
            start(id);
            const res = await updateCartItemQuantity(id, qty + 1);
            setCart(normalizeCart(cartUnwrap(res)));
        } catch {
            setToast("Không thể tăng số lượng");
        } finally {
            stop(id);
        }
    }

    async function decrease(id, qty) {
        if (qty <= 1) return;
        try {
            start(id);
            const res = await updateCartItemQuantity(id, qty - 1);
            setCart(normalizeCart(cartUnwrap(res)));
        } catch {
            setToast("Không thể giảm số lượng");
        } finally {
            stop(id);
        }
    }

    async function remove(id) {
        try {
            start(id);
            const res = await removeCartItem(id);
            setCart(normalizeCart(cartUnwrap(res)));
        } catch {
            setToast("Không thể xóa");
        } finally {
            stop(id);
        }
    }

    async function checkout() {
        try {
            setCheckingOut(true);
            const res = await checkoutCart();
            setCart(normalizeCart(cartUnwrap(res?.cart)));
            navigate("/my-courses");
        } catch {
            setToast("Thanh toán thất bại");
        } finally {
            setCheckingOut(false);
        }
    }

    return {
        items,
        totalItems,
        subtotal,
        processing,
        checkingOut,
        toast,
        setToast,
        increase,
        decrease,
        remove,
        checkout,
        navigate,
    };
}
