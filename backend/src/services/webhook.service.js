import Order from "../models/Order.js";
import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import Cart from "../models/Cart.js";

export const parseOrderCode = (content) => {
  const match = content?.match(/ED\w+/);
  return match ? match[0] : null;
};

export const processWebhook = async (payload) => {
  const { id, transferAmount, content, transferType } = payload;

  // Only process incoming transfers
  if (transferType !== "in") return;

  const orderCode = parseOrderCode(content);
  if (!orderCode) return;

  const order = await Order.findOne({ orderCode, status: "pending" });
  if (!order) return;

  // Verify amount
  if (Number(transferAmount) < order.totalAmount) {
    console.log(
      `Amount mismatch: expected ${order.totalAmount}, got ${transferAmount} for ${orderCode}`
    );
    return;
  }

  // Mark as paid
  order.status = "paid";
  order.paidAt = new Date();
  order.sepayTransactionId = String(id);
  await order.save();

  // Post-payment processing
  await processPayment(order);
};

const processPayment = async (order) => {
  // Find student by userId
  const student = await Student.findOne({ userId: order.userId });

  for (const item of order.items) {
    // Create enrollment
    if (student) {
      await Enrollment.findOneAndUpdate(
        { studentId: student._id, courseId: item.courseId },
        { studentId: student._id, courseId: item.courseId, enrolledAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // Increment totalEnrollments
    const course = await Course.findByIdAndUpdate(item.courseId, {
      $inc: { totalEnrollments: 1 },
    });

    // Update instructor revenue
    if (course?.instructorId) {
      await Instructor.findByIdAndUpdate(course.instructorId, {
        $inc: { revenue: item.price },
      });
    }
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: order.userId }, { $set: { items: [] } });
};
