import * as checkoutService from "../services/checkout.service.js";

export const checkout = async (req, res) => {
  try {
    const result = await checkoutService.createOrder(req.actor.userId);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getCheckoutInfo = async (req, res) => {
  try {
    const result = await checkoutService.getCheckoutInfo(
      req.params.orderId,
      req.actor,
    );
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const result = await checkoutService.getOrderStatus(
      req.params.orderId,
      req.actor,
    );
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const result = await checkoutService.listOrders(req.actor);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const retryOrder = async (req, res) => {
  try {
    const result = await checkoutService.retryOrder(
      req.params.orderId,
      req.actor,
    );
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};
