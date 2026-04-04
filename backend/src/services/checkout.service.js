import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import crypto from "crypto";
import { assertOrderAccess } from "./access.service.js";
import { createHttpError } from "../utils/httpError.js";

const ORDER_EXPIRY_MINUTES = 10;

const buildOrderItemsSignature = (items) =>
  items
    .map((item) => `${item.courseId.toString()}:${item.quantity}`)
    .sort((a, b) => a.localeCompare(b))
    .join("|");

const generateOrderCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ED${timestamp}${random}`;
};

const serializeOrderItem = (item, courseSlugMap) => {
  const plainItem = typeof item?.toObject === "function" ? item.toObject() : item;

  return {
    ...plainItem,
    quantity: plainItem.quantity ?? 1,
    courseSlug: courseSlugMap.get(plainItem.courseId.toString()) ?? null,
  };
};

const getEffectiveFulfillmentStatus = (order) =>
  order.fulfillmentStatus ??
  (order.status === "paid" ? "completed" : "pending");

const serializeOrder = (order, courseSlugMap, { includeQr = false } = {}) => ({
  orderId: order._id,
  orderCode: order.orderCode,
  totalAmount: order.totalAmount,
  status: order.status,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  fulfillmentStatus: getEffectiveFulfillmentStatus(order),
  paidAt: order.paidAt,
  fulfilledAt: order.fulfilledAt,
  items: order.items.map((item) => serializeOrderItem(item, courseSlugMap)),
  expiredAt: order.expiredAt,
  canRetry: order.status === "expired",
  isReadyToLearn:
    order.status === "paid" &&
    getEffectiveFulfillmentStatus(order) === "completed",
  ...(includeQr
    ? { qrUrl: generateQrUrl(order.orderCode, order.totalAmount) }
    : {}),
});

const getCourseSlugMap = async (orders) => {
  const courseIds = orders.flatMap((order) =>
    order.items.map((item) => item.courseId),
  );

  if (courseIds.length === 0) {
    return new Map();
  }

  const courses = await Course.find({ _id: { $in: courseIds } })
    .select("_id slug")
    .lean();

  return new Map(courses.map((course) => [course._id.toString(), course.slug]));
};

const expireStalePendingOrders = async (userId) => {
  await Order.updateMany(
    {
      userId,
      status: "pending",
      expiredAt: { $lte: new Date() },
    },
    {
      $set: {
        status: "expired",
      },
    },
  );
};

const getOrCreatePendingOrder = async ({
  userId,
  items,
  totalAmount,
}) => {
  const itemsSignature = buildOrderItemsSignature(items);
  const now = new Date();

  await expireStalePendingOrders(userId);

  const existingOrder = await Order.findOne({
    userId,
    status: "pending",
    itemsSignature,
    totalAmount,
    expiredAt: { $gt: now },
  }).sort({ createdAt: -1 });

  if (existingOrder) {
    return existingOrder;
  }

  const orderCode = generateOrderCode();
  const expiredAt = new Date(now.getTime() + ORDER_EXPIRY_MINUTES * 60 * 1000);

  return await Order.create({
    orderCode,
    userId,
    items,
    itemsSignature,
    totalAmount,
    fulfillmentStatus: "pending",
    expiredAt,
  });
};

const expireOrderIfNeeded = async (order) => {
  if (order.status === "pending" && new Date() > order.expiredAt) {
    order.status = "expired";

    if (typeof order.save === "function") {
      await order.save();
    }
  }

  return order;
};

export const generateQrUrl = (orderCode, amount) => {
  const acc = process.env.SEPAY_BANK_ACCOUNT;
  const bank = process.env.SEPAY_BANK_NAME;
  return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${orderCode}`;
};

export const createOrder = async (userId) => {
  const student = await Student.findOne({ userId }).select("_id");

  if (!student) {
    throw createHttpError(403, "Student profile not found");
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.course");

  if (!cart || cart.items.length === 0) {
    throw createHttpError(400, "Cart is empty");
  }

  const invalidItem = cart.items.find(
    (item) => !item.course || item.course.status !== "published",
  );

  if (invalidItem) {
    throw createHttpError(400, "Cart contains unavailable courses");
  }

  const items = cart.items.map((item) => {
    const quantity = item.quantity ?? 1;
    const effectivePrice = item.course.salePrice ?? item.course.price ?? 0;

    return {
      courseId: item.course._id,
      title: item.course.title,
      price: effectivePrice * quantity,
      quantity,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const order = await getOrCreatePendingOrder({
    userId,
    items,
    totalAmount,
  });

  return {
    orderId: order._id,
    orderCode: order.orderCode,
    totalAmount: order.totalAmount,
    qrUrl: generateQrUrl(order.orderCode, order.totalAmount),
    expiredAt: order.expiredAt,
    status: order.status,
    fulfillmentStatus: getEffectiveFulfillmentStatus(order),
  };
};

export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  return order;
};

export const getCheckoutInfo = async (orderId, actor) => {
  const order = await expireOrderIfNeeded(await assertOrderAccess(orderId, actor));
  const courseSlugMap = await getCourseSlugMap([order]);

  return serializeOrder(order, courseSlugMap, { includeQr: true });
};

export const getOrderStatus = async (orderId, actor) => {
  const order = await expireOrderIfNeeded(await assertOrderAccess(orderId, actor));

  return {
    status: order.status,
    fulfillmentStatus: getEffectiveFulfillmentStatus(order),
    canRetry: order.status === "expired",
    isReadyToLearn:
      order.status === "paid" &&
      getEffectiveFulfillmentStatus(order) === "completed",
  };
};

export const listOrders = async (actor) => {
  const orders = await Order.find({ userId: actor.userId })
    .sort({ createdAt: -1 })
    .limit(50);

  for (const order of orders) {
    await expireOrderIfNeeded(order);
  }

  const courseSlugMap = await getCourseSlugMap(orders);

  return orders.map((order) => serializeOrder(order, courseSlugMap));
};

export const retryOrder = async (orderId, actor) => {
  const order = await expireOrderIfNeeded(await assertOrderAccess(orderId, actor));

  if (order.status === "paid") {
    throw createHttpError(400, "Paid orders cannot be retried");
  }

  const totalAmount = order.items.reduce(
    (sum, item) => sum + item.price,
    0,
  );
  const retryOrderDoc = await getOrCreatePendingOrder({
    userId: order.userId,
    items: order.items.map((item) => ({
      courseId: item.courseId,
      title: item.title,
      price: item.price,
      quantity: item.quantity ?? 1,
    })),
    totalAmount,
  });

  return {
    orderId: retryOrderDoc._id,
    orderCode: retryOrderDoc.orderCode,
    totalAmount: retryOrderDoc.totalAmount,
    qrUrl: generateQrUrl(
      retryOrderDoc.orderCode,
      retryOrderDoc.totalAmount,
    ),
    expiredAt: retryOrderDoc.expiredAt,
    status: retryOrderDoc.status,
    fulfillmentStatus: getEffectiveFulfillmentStatus(retryOrderDoc),
  };
};
