import { useEffect, useState } from "react";
import { CartContext } from "./cartContext";
import {
    getCartApi,
    addToCartApi,
    removeFromCartApi,
    updateQuantityApi,
} from "../api/cartApi";

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const loadCart = async () => {
        const data = await getCartApi();

        if (data?.items) {
            const formatted = data.items.map((item) => ({
                id: item.course._id,
                title: item.course.title,
                price: item.course.price,
                quantity: item.quantity,
            }));

            setCartItems(formatted);
        }
    };

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const data = await getCartApi();

                if (data?.items) {
                    const formatted = data.items.map((item) => ({
                        id: item.course._id,
                        title: item.course.title,
                        price: item.course.price,
                        quantity: item.quantity,
                    }));

                    setCartItems(formatted);
                }
            } catch (err) {
                console.log("Load cart error:", err);
            }
        };

        fetchCart();
    }, []);

    const addToCart = async (courseId) => {
        await addToCartApi(courseId);
        await loadCart();
    };

    const removeFromCart = async (courseId) => {
        await removeFromCartApi(courseId);
        await loadCart();
    };

    const updateQuantity = async (courseId, quantity) => {
        if (quantity < 1) return;
        await updateQuantityApi(courseId, quantity);
        await loadCart();
    };

    const getTotalPrice = () =>
        cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
        );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                getTotalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
