import express from "express";
import {
  getQuizAttemptsByStudentCourse,
  getQuizAttemptReviewById,
  getLatestQuizAttemptReview,
  submitQuizAttempt,
} from "./quizAttempt.controller.js";

const router = express.Router();

router.get("/student/:studentId/course/:courseId", getQuizAttemptsByStudentCourse);
router.get("/:attemptId/review", getQuizAttemptReviewById);
router.get("/latest/quiz/:quizId/student/:studentId", getLatestQuizAttemptReview);
router.post("/quiz/:quizId", submitQuizAttempt);

export default router;