import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    itemsSignature: {
      type: String,
      required: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "expired"],
      default: "pending",
    },
    paidAt: Date,
    sepayTransactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    fulfilledAt: Date,
    lastProcessingError: String,
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, status: 1, itemsSignature: 1, totalAmount: 1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
