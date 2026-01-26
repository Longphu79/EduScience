import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String, // mô tả ngắn nội dung bài học
    },

    videoUrl: {
      type: String,
      required: true, // video bài học
    },

    duration: {
      type: Number, // thời lượng (phút hoặc giây)
      default: 0,
    },

    order: {
      type: Number, // thứ tự trong section
      required: true,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    isPreview: {
      type: Boolean,
      default: false, // cho phép xem trước khi mua
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
