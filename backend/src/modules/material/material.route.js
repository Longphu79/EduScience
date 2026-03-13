import express from "express";
import {
  createMaterial,
  getMaterialsByCourse,
  getMaterialsByLesson,
  updateMaterial,
  deleteMaterial,
} from "./material.controller.js";

const router = express.Router();

router.get("/course/:courseId", getMaterialsByCourse);
router.get("/lesson/:lessonId", getMaterialsByLesson);
router.post("/", createMaterial);
router.put("/:materialId", updateMaterial);
router.delete("/:materialId", deleteMaterial);

export default router;