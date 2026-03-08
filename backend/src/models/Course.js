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
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      maxlength: 160,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    previewVideo: {
      type: String,
      default: "",
    },

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
      min: 0,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
      default: null,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    instructorId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEnrollments: {
      type: Number,
      default: 0,
      min: 0,
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

    lessonIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);