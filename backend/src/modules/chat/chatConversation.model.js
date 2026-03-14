import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

chatConversationSchema.index(
  { courseId: 1, studentId: 1, instructorId: 1 },
  { unique: true }
);

const ChatConversation = mongoose.model(
  "ChatConversation",
  chatConversationSchema
);

export default ChatConversation;