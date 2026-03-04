import { request } from "../../../services/https.js";

export const getWishlistApi = () => {
  return request("/wishlist/get", {
    method: "GET",
  });
};

export const addWishlistApi = (courseId) => {
  return request(`/wishlist/${courseId}`, {
    method: "POST",
  });
};

export const removeFromWishlistApi = (courseId) => {
  return request(`/wishlist/${courseId}`, {
    method: "PUT",
  });
};

export const clearWishlistApi = () => {
  return request("/wishlist", {
    method: "PUT",
  });
};