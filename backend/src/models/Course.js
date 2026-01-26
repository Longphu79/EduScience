import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    shortDescription: {
      type: String,
      required: true,
      maxlength: 160,
    },

    description: String,
    category: String,
    thumbnail: String,
    previewVideo: String,

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    language: {
      type: String,
      default: "vi",
    },

    duration: {
      type: Number, // phút
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalEnrollments: {
      type: Number,
      default: 0,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    lessonIds: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },

      totalLessons: {
        type: Number,
        default: 0,
      },
  }, { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
