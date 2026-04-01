import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        icon: {
            type: String,
            default: "🏆",
            trim: true,
        },
        ruleType: {
            type: String,
            enum: [
                "complete_courses",
                "quiz_pass_rate",
                "quiz_score",
                "streak_days",
                "assignment_count",
                "certificate_count",
            ],
            required: true,
        },
        ruleValue: {
            type: Number,
            required: true,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const Badge = mongoose.models.Badge || mongoose.model("Badge", badgeSchema);

export default Badge;
