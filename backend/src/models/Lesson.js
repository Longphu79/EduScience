import mongoose from "mongoose";

const lessonResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "link",
      trim: true,
    },
  },
  { _id: false },
);

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

    thumbnail: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: Number, // thời lượng (phút hoặc giây)
      default: 0,
    },

    estimatedCompletionMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    order: {
      type: Number, // thứ tự trong section
      required: true,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
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

    objectives: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },

    resources: {
      type: [lessonResourceSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
