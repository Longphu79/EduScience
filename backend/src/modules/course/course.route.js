import express from "express";
import {
  getPopularCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  getCoursesByInstructor,
} from "./course.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/slug/:slug", getCourseBySlug);
router.get("/popular", getPopularCourses);
router.get("/instructor/:instructorId", verifyToken, getCoursesByInstructor);
router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);

router.post("/", verifyToken, createCourse);
router.put("/:courseId", verifyToken, updateCourse);
router.delete("/:courseId", verifyToken, deleteCourse);

export default router;