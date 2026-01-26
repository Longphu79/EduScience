import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    expertise: [String],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Instructor", instructorSchema);
