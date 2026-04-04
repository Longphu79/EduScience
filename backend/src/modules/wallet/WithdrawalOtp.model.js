import mongoose from "mongoose";

const withdrawalOtpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        bankInfo: {
            bankCode: String,
            bankName: String,
            accountNumber: String,
            accountName: String,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        used: {
            type: Boolean,
            default: false,
        },
        attempts: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export default mongoose.model("WithdrawalOtp", withdrawalOtpSchema);