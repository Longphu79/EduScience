import express from "express";
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireRoles,
} from "../middleware/authMiddleware.js";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller.js";
import {
  createLessonComment,
  getLessonComments,
} from "../controllers/lessonComment.controller.js";

const router = express.Router();

router.post("/", authMiddleware, requireRoles("instructor", "admin"), createLesson);
router.get("/course/:courseId", optionalAuthMiddleware, getLessonsByCourse);
router.get("/:lessonId/comments", optionalAuthMiddleware, getLessonComments);
router.post("/:lessonId/comments", authMiddleware, createLessonComment);
router.get("/:lessonId", optionalAuthMiddleware, getLessonById);
router.put("/:lessonId", authMiddleware, requireRoles("instructor", "admin"), updateLesson);
router.delete("/:lessonId", authMiddleware, requireRoles("instructor", "admin"), deleteLesson);

export default router;
