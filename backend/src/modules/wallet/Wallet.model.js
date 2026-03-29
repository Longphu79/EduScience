import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        userModel: {
            type: String,
            enum: ["Student", "Instructor"],
            required: true,
        },
        balance: { type: Number, default: 0 },
        totalDeposited: { type: Number, default: 0 }, // Tổng tiền Student đã nạp
        totalEarned: { type: Number, default: 0 }, // Tổng tiền Instructor đã kiếm
    },
    { timestamps: true },
);

export default mongoose.model("Wallet", walletSchema);
