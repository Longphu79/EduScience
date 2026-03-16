import express from "express";
import {
  createMaterial,
  getMaterialsByCourse,
  getMaterialsByLesson,
  updateMaterial,
  deleteMaterial,
} from "./material.controller.js";
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

router.get("/course/:courseId", getMaterialsByCourse);
router.get("/lesson/:lessonId", getMaterialsByLesson);

router.post("/", verifyToken, createMaterial);
router.put("/:materialId", verifyToken, updateMaterial);
router.delete("/:materialId", verifyToken, deleteMaterial);

export default router;