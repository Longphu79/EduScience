import mongoose from "mongoose";

const lessonNotebookSchema = new mongoose.Schema(
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

    note: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

lessonNotebookSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

export default mongoose.models.LessonNotebook ||
  mongoose.model("LessonNotebook", lessonNotebookSchema);
