import request from "../../../services/request";

export const getMyCart = () => request.get("/api/cart");

export const addToCart = (courseId) =>
  request.post("/api/cart/add", { courseId });