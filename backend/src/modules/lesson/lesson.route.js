import express from "express";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse,
} from "./lesson.controller.js";
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

router.get("/course/:courseId", getLessonsByCourse);

router.post("/", verifyToken, createLesson);
router.put("/:lessonId", verifyToken, updateLesson);
router.delete("/:lessonId", verifyToken, deleteLesson);

export default router;