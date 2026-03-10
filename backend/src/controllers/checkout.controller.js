import * as checkoutService from "../services/checkout.service.js";

export const checkout = async (req, res) => {
  try {
    const result = await checkoutService.createOrder(req.user.userId);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getCheckoutInfo = async (req, res) => {
  try {
    const result = await checkoutService.getCheckoutInfo(req.params.orderId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const result = await checkoutService.getOrderStatus(req.params.orderId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
