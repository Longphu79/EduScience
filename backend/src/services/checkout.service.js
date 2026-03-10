import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import crypto from "crypto";

const ORDER_EXPIRY_MINUTES = 10;

const generateOrderCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ED${timestamp}${random}`;
};

export const generateQrUrl = (orderCode, amount) => {
  const acc = process.env.SEPAY_BANK_ACCOUNT;
  const bank = process.env.SEPAY_BANK_NAME;
  return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${orderCode}`;
};

export const createOrder = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.course");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const items = cart.items.map((item) => ({
    courseId: item.course._id,
    title: item.course.title,
    price: item.course.price * item.quantity,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const orderCode = generateOrderCode();
  const expiredAt = new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60 * 1000);

  const order = await Order.create({
    orderCode,
    userId,
    items,
    totalAmount,
    expiredAt,
  });

  return {
    orderId: order._id,
    orderCode: order.orderCode,
    totalAmount: order.totalAmount,
    qrUrl: generateQrUrl(orderCode, totalAmount),
    expiredAt: order.expiredAt,
  };
};

export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  return order;
};

export const getCheckoutInfo = async (orderId) => {
  const order = await getOrderById(orderId);
  return {
    orderId: order._id,
    orderCode: order.orderCode,
    totalAmount: order.totalAmount,
    status: order.status,
    items: order.items,
    qrUrl: generateQrUrl(order.orderCode, order.totalAmount),
    expiredAt: order.expiredAt,
  };
};

export const getOrderStatus = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // Check expiry
  if (order.status === "pending" && new Date() > order.expiredAt) {
    order.status = "expired";
    await order.save();
  }

  return { status: order.status };
};
