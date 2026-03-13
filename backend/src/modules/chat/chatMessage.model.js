import mongoose from "mongoose";

const courseChatMessageSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["student", "instructor", "admin"],
      required: true,
    },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const CourseChatMessage = mongoose.model(
  "CourseChatMessage",
  courseChatMessageSchema
);

export default CourseChatMessage;