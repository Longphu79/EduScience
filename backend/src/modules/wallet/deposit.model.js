import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: { type: Number, required: true },
        code: { type: String, unique: true }, // Mã nội dung chuyển khoản (Ví dụ: DEP12345)
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending",
        },
        adminNote: String,
    },
    { timestamps: true },
);

export default mongoose.model("Deposit", depositSchema);
