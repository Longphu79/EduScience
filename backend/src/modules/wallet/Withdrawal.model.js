import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userModel: {
            type: String,
            enum: ["Student", "Instructor"],
            required: true,
        },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "completed", "rejected"],
            default: "pending",
        },
        bankInfo: {
            bankCode: String,
            bankName: String,
            accountNumber: String,
            accountName: String,
        },
        adminNote: { type: String, default: "" },
        processedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

export default mongoose.model("Withdrawal", withdrawalSchema);