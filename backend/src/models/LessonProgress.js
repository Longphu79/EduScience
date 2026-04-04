import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
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

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },

    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

lessonProgressSchema.index(
  { studentId: 1, courseId: 1, lessonId: 1 },
  { unique: true },
);

export default mongoose.models.LessonProgress ||
  mongoose.model("LessonProgress", lessonProgressSchema);
