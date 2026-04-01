import mongoose from "mongoose";

const studentGamificationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        xp: {
            type: Number,
            default: 0,
            min: 0,
        },
        level: {
            type: Number,
            default: 1,
            min: 1,
        },
        currentStreak: {
            type: Number,
            default: 0,
            min: 0,
        },
        bestStreak: {
            type: Number,
            default: 0,
            min: 0,
        },
        badgeIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Badge",
            },
        ],
        lastXpUpdateAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

const StudentGamification =
    mongoose.models.StudentGamification ||
    mongoose.model("StudentGamification", studentGamificationSchema);

export default StudentGamification;
