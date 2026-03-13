import express from "express";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse,
} from "./lesson.controller.js";

const router = express.Router();

router.get("/course/:courseId", getLessonsByCourse);
router.post("/", createLesson);
router.put("/:lessonId", updateLesson);
router.delete("/:lessonId", deleteLesson);

export default router;