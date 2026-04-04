"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";

import { useAuth } from "@/components/auth/auth-provider";
import {
  backendBrowserApiFetch,
  backendBrowserPostJson,
  backendBrowserPutJson,
} from "@/lib/web-api";

const StudentCommerceContext = createContext(null);

const normalizeWishlistCourses = (wishlist) =>
  Array.isArray(wishlist?.courseIds) ? wishlist.courseIds.filter(Boolean) : [];

const normalizeCartItems = (cart) => (Array.isArray(cart?.items) ? cart.items.filter(Boolean) : []);

const getCourseId = (courseLike) => {
  if (!courseLike) {
    return null;
  }

  if (typeof courseLike === "string") {
    return courseLike;
  }

  return courseLike._id ?? null;
};

const getCartCourse = (item) => {
  if (!item) {
    return null;
  }

  if (item.course && typeof item.course === "object") {
    return item.course;
  }

  return null;
};

export function StudentCommerceProvider({ children }) {
  const auth = useAuth();
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const applySnapshot = (wishlist, cart) => {
    setWishlistCourses(normalizeWishlistCourses(wishlist));
    setCartItems(normalizeCartItems(cart));
  };

  const resetSnapshot = () => {
    setWishlistCourses([]);
    setCartItems([]);
    setLoaded(true);
    setLoading(false);
  };

  const refreshCommerce = async () => {
    if (!auth.isAuthenticated || auth.role !== "student") {
      resetSnapshot();
      return;
    }

    setLoading(true);

    try {
      const [wishlist, cart] = await Promise.all([
        backendBrowserApiFetch("/wishlist/get").catch(() => null),
        backendBrowserApiFetch("/api/cart").catch(() => ({ items: [] })),
      ]);

      applySnapshot(wishlist, cart);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.loading) {
      return;
    }

    refreshCommerce().catch(() => {
      resetSnapshot();
    });
  }, [auth.isAuthenticated, auth.loading, auth.role]);

  const toggleWishlist = async ({ courseId, courseTitle }) => {
    const activeId = getCourseId(courseId);

    if (!activeId) {
      throw new Error("Missing courseId");
    }

    const exists = wishlistCourses.some((course) => getCourseId(course) === activeId);

    if (exists) {
      await backendBrowserPutJson(`/wishlist/${activeId}`, {});
      notifications.show({
        color: "blue",
        title: "Wishlist updated",
        message: `${courseTitle || "Course"} removed from wishlist.`,
      });
    } else {
      await backendBrowserPostJson(`/wishlist/${activeId}`, {});
      notifications.show({
        color: "blue",
        title: "Saved for later",
        message: `${courseTitle || "Course"} added to wishlist.`,
      });
    }

    await refreshCommerce();
  };

  const clearWishlist = async () => {
    await backendBrowserPutJson("/wishlist", {});
    notifications.show({
      color: "blue",
      title: "Wishlist cleared",
      message: "All saved courses were removed.",
    });
    await refreshCommerce();
  };

  const addToCart = async ({ courseId, courseTitle }) => {
    const activeId = getCourseId(courseId);

    if (!activeId) {
      throw new Error("Missing courseId");
    }

    const response = await backendBrowserPostJson("/api/cart/add", {
      courseId: activeId,
    });

    setCartItems(normalizeCartItems(response?.cart));
    notifications.show({
      color: "blue",
      title: "Added to cart",
      message: `${courseTitle || "Course"} is ready for checkout.`,
    });

    return response;
  };

  const updateCartQuantity = async ({ courseId, quantity }) => {
    const response = await backendBrowserPutJson("/api/cart/update", {
      courseId,
      quantity,
    });

    setCartItems(normalizeCartItems(response?.cart));
    return response;
  };

  const removeFromCart = async ({ courseId, courseTitle }) => {
    const response = await backendBrowserPutJson("/api/cart/remove", {
      courseId,
    });

    setCartItems(normalizeCartItems(response?.cart));
    notifications.show({
      color: "blue",
      title: "Removed from cart",
      message: `${courseTitle || "Course"} was removed from checkout queue.`,
    });

    return response;
  };

  const createCheckout = async () => {
    const order = await backendBrowserPostJson("/api/checkout", {});

    notifications.show({
      color: "blue",
      title: "Checkout started",
      message: `Order ${order.orderCode} is ready for payment.`,
    });

    return order;
  };

  const wishlistIds = wishlistCourses.map((course) => getCourseId(course)).filter(Boolean);
  const cartCourseIds = cartItems
    .map((item) => getCourseId(item.course))
    .filter(Boolean);
  const cartQuantity = cartItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  const cartSubtotal = cartItems.reduce((sum, item) => {
    const course = getCartCourse(item);
    const unitPrice = course?.salePrice ?? course?.price ?? 0;
    return sum + unitPrice * (item.quantity ?? 1);
  }, 0);

  const value = {
    loading,
    loaded,
    wishlistCourses,
    wishlistIds,
    cartItems,
    cartCourseIds,
    cartQuantity,
    cartSubtotal,
    isInWishlist: (courseId) => wishlistIds.includes(getCourseId(courseId)),
    isInCart: (courseId) => cartCourseIds.includes(getCourseId(courseId)),
    refreshCommerce,
    toggleWishlist,
    clearWishlist,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    createCheckout,
  };

  return (
    <StudentCommerceContext.Provider value={value}>
      {children}
    </StudentCommerceContext.Provider>
  );
}

export const useStudentCommerce = () => {
  const context = useContext(StudentCommerceContext);

  if (!context) {
    throw new Error("useStudentCommerce must be used within StudentCommerceProvider");
  }

  return context;
};
