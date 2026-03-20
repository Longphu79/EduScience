import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
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
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
      index: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    allowResubmit: {
      type: Boolean,
      default: true,
    },
    maxScore: {
      type: Number,
      default: 100,
      min: 0,
    },
    attachmentUrls: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ courseId: 1, createdAt: -1 });
assignmentSchema.index({ instructorId: 1, createdAt: -1 });

export default mongoose.models.Assignment ||
  mongoose.model("Assignment", assignmentSchema);