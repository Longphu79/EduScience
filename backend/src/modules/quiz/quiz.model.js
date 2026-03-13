import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["single", "multiple", "true-false"],
      default: "single",
    },
    options: [
      {
        text: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    explanation: { type: String, default: "" },
    points: { type: Number, default: 1, min: 0 },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
      index: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timeLimit: { type: Number, default: 0 },
    passingScore: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    questions: [quizQuestionSchema],
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;