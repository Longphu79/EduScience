import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, // Phải là cái này
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["deposit", "withdrawal", "payment", "refund"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "cancelled"],
            default: "completed",
        },
        description: String,
        balanceBefore: Number, // Số dư trước khi thực hiện
        balanceAfter: Number, // Số dư sau khi thực hiện
        referenceId: {
            // ID của bảng liên quan (ví dụ ID của bảng Withdrawal)
            type: mongoose.Schema.Types.ObjectId,
            refPath: "referenceModel",
        },
        referenceModel: {
            type: String,
            enum: ["Withdrawal", "Order", "Deposit"],
        },
    },
    { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
