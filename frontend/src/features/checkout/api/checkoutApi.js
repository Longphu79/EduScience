import { request } from "../../../services/https";

export const createCheckout = () =>
  request("/api/checkout", { method: "POST" });

export const getCheckoutInfo = (orderId) =>
  request(`/api/checkout/${orderId}`);

export const getPaymentStatus = (orderId) =>
  request(`/api/order/${orderId}/status`);
