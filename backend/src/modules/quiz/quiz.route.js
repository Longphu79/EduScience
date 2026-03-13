import express from "express";
import {
  createQuiz,
  getQuizByCourse,
  getInstructorQuizzesByCourse,
  getQuizById,
  submitQuizAttempt,
  getAttemptsByStudentCourse,
  getAttemptReviewById,
  getQuizResultsByQuizId,
  getQuizAttemptsByQuizAndStudent,
  getInstructorAttemptReviewById,
  updateQuiz,
  deleteQuiz,
} from "./quiz.controller.js";

const router = express.Router();

/* instructor routes */
router.get("/instructor/course/:courseId", getInstructorQuizzesByCourse);
router.get("/:quizId/results", getQuizResultsByQuizId);
router.get("/:quizId/results/student/:studentId", getQuizAttemptsByQuizAndStudent);
router.get("/attempt/:attemptId/instructor-review", getInstructorAttemptReviewById);

/* student/public routes */
router.get("/course/:courseId", getQuizByCourse);
router.get("/attempt/student/:studentId/course/:courseId", getAttemptsByStudentCourse);
router.get("/attempt/:attemptId/review", getAttemptReviewById);
router.get("/:quizId", getQuizById);

router.post("/", createQuiz);
router.post("/:quizId/attempt", submitQuizAttempt);

router.put("/:quizId", updateQuiz);
router.delete("/:quizId", deleteQuiz);

export default router;