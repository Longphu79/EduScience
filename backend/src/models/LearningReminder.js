import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    remindAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

reminderSchema.index({ studentId: 1, courseId: 1, remindAt: 1 });

export default mongoose.models.LearningReminder ||
  mongoose.model("LearningReminder", reminderSchema);
