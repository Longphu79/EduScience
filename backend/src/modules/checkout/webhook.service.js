import Order from "../../models/Order.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Student from "../../models/Student.js";
import Course from "../course/course.model.js";
import Instructor from "../../models/Instructor.js";
import Cart from "../cart/cart.model.js";

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
            `Amount mismatch: expected ${order.totalAmount}, got ${transferAmount} for ${orderCode}`,
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
                {
                    studentId: student._id,
                    courseId: item.courseId,
                    enrolledAt: new Date(),
                },
                { upsert: true, new: true },
            );
        }

        const course = await Course.findById(item.courseId);
        if (course?.instructorId) {
            const PLATFORM_FEE = 0.2;
            const instructorEarning = item.price * (1 - PLATFORM_FEE);

            await Wallet.findOneAndUpdate(
                { userId: course.instructorId },
                {
                    $inc: {
                        balance: instructorEarning,
                        totalEarned: instructorEarning,
                    },
                    userModel: "Instructor",
                },
                { upsert: true },
            );

            await Wallet.findOneAndUpdate(
                { userId: order.userId },
                { $inc: { totalDeposited: item.price }, userModel: "Student" }, // totalDeposited ở đây hiểu là tổng chi tiêu
                { upsert: true },
            );
        }
    }

    await Cart.findOneAndUpdate(
        { user: order.userId },
        { $set: { items: [] } },
    );
};
