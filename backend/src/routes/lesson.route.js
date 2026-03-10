import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createLesson);
router.get("/course/:courseId", getLessonsByCourse);
router.get("/:lessonId", getLessonById);
router.put("/:lessonId", authMiddleware, updateLesson);
router.delete("/:lessonId", authMiddleware, deleteLesson);

export default router;
