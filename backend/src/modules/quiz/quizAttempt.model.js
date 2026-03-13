import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOptionIndexes: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const reviewOptionSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    text: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
    isSelected: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionReviewSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    questionText: {
      type: String,
      default: "",
    },
    explanation: {
      type: String,
      default: "",
    },
    options: {
      type: [reviewOptionSchema],
      default: [],
    },
    correctOptionIndexes: {
      type: [Number],
      default: [],
    },
    selectedOptionIndexes: {
      type: [Number],
      default: [],
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    questionReviews: {
      type: [questionReviewSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;