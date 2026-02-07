import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
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

    // permissions: {
    //   type: [String],
    //   default: [
    //     "MANAGE_USERS",
    //     "MANAGE_COURSES",
    //     "VIEW_REPORTS",
    //   ],
    // },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
