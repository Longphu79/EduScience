import mongoose from "mongoose";

const gamificationEventSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        xpEarned: {
            type: Number,
            default: 0,
            min: 0,
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
        },
        sourceType: {
            type: String,
            default: "",
            trim: true,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true },
);

gamificationEventSchema.index(
    { studentId: 1, type: 1, sourceId: 1, sourceType: 1 },
    { unique: false },
);

const GamificationEvent =
    mongoose.models.GamificationEvent ||
    mongoose.model("GamificationEvent", gamificationEventSchema);

export default GamificationEvent;
