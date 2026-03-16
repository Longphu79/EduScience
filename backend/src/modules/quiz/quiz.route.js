import express from "express";
import {
  createQuiz,
  getQuizByCourse,
  getInstructorQuizzesByCourse,
  getQuizById,
  submitQuizAttempt,
  getAttemptsByStudentCourse,
  getMyAttemptsByCourse,
  getAttemptReviewById,
  getQuizResultsByQuizId,
  getQuizAttemptsByQuizAndStudent,
  getInstructorAttemptReviewById,
  updateQuiz,
  deleteQuiz,
} from "./quiz.controller.js";
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

/* instructor/admin routes */
router.get(
  "/instructor/course/:courseId",
  verifyToken,
  getInstructorQuizzesByCourse
);
router.get("/:quizId/results", verifyToken, getQuizResultsByQuizId);
router.get(
  "/:quizId/results/student/:studentId",
  verifyToken,
  getQuizAttemptsByQuizAndStudent
);
router.get(
  "/attempt/:attemptId/instructor-review",
  verifyToken,
  getInstructorAttemptReviewById
);

router.post("/", verifyToken, createQuiz);
router.put("/:quizId", verifyToken, updateQuiz);
router.delete("/:quizId", verifyToken, deleteQuiz);

/* student/public routes */
router.get("/course/:courseId", getQuizByCourse);

/* new route for current logged-in student */
router.get(
  "/attempt/course/:courseId/my",
  verifyToken,
  getMyAttemptsByCourse
);

/* keep old route for backward compatibility */
router.get(
  "/attempt/student/:studentId/course/:courseId",
  verifyToken,
  getAttemptsByStudentCourse
);

router.get("/attempt/:attemptId/review", verifyToken, getAttemptReviewById);
router.get("/:quizId", verifyToken, getQuizById);
router.post("/:quizId/attempt", verifyToken, submitQuizAttempt);

export default router;