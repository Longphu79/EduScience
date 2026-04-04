import mongoose from "mongoose";

const lessonCommentSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorRole: {
      type: String,
      enum: ["student", "instructor", "admin"],
      required: true,
    },
    authorDisplayName: {
      type: String,
      required: true,
      trim: true,
    },
    authorAvatarUrl: {
      type: String,
      default: "",
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

lessonCommentSchema.index({ lessonId: 1, createdAt: -1 });

export default mongoose.models.LessonComment ||
  mongoose.model("LessonComment", lessonCommentSchema);
