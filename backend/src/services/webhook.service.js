import Order from "../models/Order.js";
import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import Cart from "../models/Cart.js";
import { createHttpError } from "../utils/httpError.js";

const FULFILLMENT_STALE_MS = 60 * 1000;

export const parseOrderCode = (content) => {
  const match = content?.match(/ED\w+/);
  return match ? match[0] : null;
};

const claimOrderForFulfillment = async (orderId, transactionId) => {
  const now = new Date();
  const staleBefore = new Date(Date.now() - FULFILLMENT_STALE_MS);

  return await Order.findOneAndUpdate(
    {
      _id: orderId,
      $or: [
        { status: "pending" },
        {
          status: "paid",
          sepayTransactionId: transactionId,
          fulfillmentStatus: "failed",
        },
        {
          status: "paid",
          sepayTransactionId: transactionId,
          fulfillmentStatus: "pending",
        },
        {
          status: "paid",
          sepayTransactionId: transactionId,
          fulfillmentStatus: "processing",
          updatedAt: { $lte: staleBefore },
        },
      ],
    },
    {
      $set: {
        status: "paid",
        paidAt: now,
        sepayTransactionId: transactionId,
        fulfillmentStatus: "processing",
        lastProcessingError: null,
      },
    },
    { new: true },
  );
};

const finalizeOrder = async (order) => {
  const student = await Student.findOne({ userId: order.userId }).select("_id");

  if (!student) {
    throw createHttpError(500, "Student profile not found for order");
  }

  const purchasedCourseIds = [];

  for (const item of order.items) {
    purchasedCourseIds.push(item.courseId);

    const enrollmentResult = await Enrollment.updateOne(
      {
        studentId: student._id,
        courseId: item.courseId,
      },
      {
        $setOnInsert: {
          studentId: student._id,
          courseId: item.courseId,
          enrolledAt: new Date(),
          progress: 0,
          completed: false,
        },
      },
      { upsert: true },
    );

    const createdEnrollment = enrollmentResult.upsertedCount > 0;

    if (!createdEnrollment) {
      continue;
    }

    const course = await Course.findByIdAndUpdate(
      item.courseId,
      {
        $inc: { totalEnrollments: 1 },
      },
      { new: true },
    ).select("instructorId");

    if (course?.instructorId) {
      await Instructor.findByIdAndUpdate(course.instructorId, {
        $inc: { revenue: item.price },
      });
    }
  }

  if (purchasedCourseIds.length > 0) {
    await Cart.findOneAndUpdate(
      { user: order.userId },
      {
        $pull: {
          items: {
            course: { $in: purchasedCourseIds },
          },
        },
      },
    );
  }

  await Order.findByIdAndUpdate(order._id, {
    $set: {
      fulfillmentStatus: "completed",
      fulfilledAt: new Date(),
      lastProcessingError: null,
    },
  });
};

export const processWebhook = async (payload) => {
  const { id, transferAmount, content, transferType } = payload;
  const transactionId = String(id);

  // Only process incoming transfers
  if (transferType !== "in") {
    return { ignored: true, reason: "unsupported-transfer-type" };
  }

  const orderCode = parseOrderCode(content);
  if (!orderCode) {
    return { ignored: true, reason: "missing-order-code" };
  }

  const order = await Order.findOne({ orderCode });
  if (!order) {
    return { ignored: true, reason: "order-not-found" };
  }

  // Verify amount
  if (Number(transferAmount) < order.totalAmount) {
    return { ignored: true, reason: "amount-mismatch" };
  }

  if (
    order.status === "paid" &&
    order.fulfillmentStatus === "completed" &&
    order.sepayTransactionId === transactionId
  ) {
    return { ignored: true, reason: "already-completed" };
  }

  if (
    order.status === "paid" &&
    order.sepayTransactionId &&
    order.sepayTransactionId !== transactionId
  ) {
    return { ignored: true, reason: "different-transaction-already-processed" };
  }

  const claimedOrder = await claimOrderForFulfillment(order._id, transactionId);

  if (!claimedOrder) {
    const latestOrder = await Order.findById(order._id);

    if (
      latestOrder?.status === "paid" &&
      latestOrder?.fulfillmentStatus === "completed" &&
      latestOrder?.sepayTransactionId === transactionId
    ) {
      return { ignored: true, reason: "already-completed" };
    }

    return { ignored: true, reason: "order-not-claimable" };
  }

  try {
    await finalizeOrder(claimedOrder);
    return { ignored: false, orderCode };
  } catch (err) {
    await Order.findByIdAndUpdate(claimedOrder._id, {
      $set: {
        fulfillmentStatus: "failed",
        lastProcessingError: err.message,
      },
    });

    throw createHttpError(500, err.message || "Webhook fulfillment failed");
  }
};
