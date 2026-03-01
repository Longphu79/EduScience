import { createContext, useContext, useEffect, useState } from "react";
import {
  getCartApi,
  addToCartApi,
  removeFromCartApi,
  updateQuantityApi,
} from "../api/cartApi";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 🔥 Load cart khi app mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
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
      0
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

export const useCart = () => useContext(CartContext);