import mongoose from "mongoose";

const instructorPayoutAccountSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      unique: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      default: "",
      trim: true,
    },
    transferNote: {
      type: String,
      default: "",
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.InstructorPayoutAccount ||
  mongoose.model("InstructorPayoutAccount", instructorPayoutAccountSchema);
