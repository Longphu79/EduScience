import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required: true,
        },

        lastLoginAt: {
            type: Date,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Admin", adminSchema);
