import mongoose from "mongoose";

const payoutAccountSnapshotSchema = new mongoose.Schema(
  {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    branch: String,
    transferNote: String,
  },
  { _id: false },
);

const payoutRequestSchema = new mongoose.Schema(
  {
    payoutCode: {
      type: String,
      required: true,
      unique: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      index: true,
    },
    payoutAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstructorPayoutAccount",
      required: true,
    },
    accountSnapshot: {
      type: payoutAccountSnapshotSchema,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "rejected"],
      default: "pending",
      index: true,
    },
    requestedNote: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedNote: {
      type: String,
      default: "",
      trim: true,
    },
    transferReference: {
      type: String,
      default: "",
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    processedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "processing", "paid", "rejected"],
        },
        note: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

payoutRequestSchema.index({ instructorId: 1, createdAt: -1 });

export default mongoose.models.PayoutRequest ||
  mongoose.model("PayoutRequest", payoutRequestSchema);
