import express from "express";
import {
  getLearningCourseBySlug,
  getMyCourses,
  listReminders,
  createReminder,
  updateLessonNotebook,
  updateLessonProgress,
  upsertCourseReview,
} from "../controllers/learning.controller.js";
import { authMiddleware, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware, requireRoles("student"));

router.get("/courses", getMyCourses);
router.get("/course/:slug", getLearningCourseBySlug);
router.put("/courses/:courseId/lessons/:lessonId/progress", updateLessonProgress);
router.put("/courses/:courseId/lessons/:lessonId/notebook", updateLessonNotebook);
router.put("/courses/:courseId/review", upsertCourseReview);
router.get("/reminders", listReminders);
router.post("/courses/:courseId/reminder", createReminder);

export default router;
