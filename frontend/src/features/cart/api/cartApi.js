import { request } from "../../../services/https.js";

export const getCartApi = () => {
  return request("/api/cart", {
    method: "GET",
  });
};

export const addToCartApi = (courseId) => {
  return request("/api/cart/add", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });
};

export const removeFromCartApi = (courseId) => {
  return request("/api/cart/remove", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });
};

export const updateQuantityApi = (courseId, quantity) => {
  return request("/api/cart/update", {
    method: "POST",
    body: JSON.stringify({ courseId, quantity }),
  });
};