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
  getCourseLearningDetail,
} from "../controllers/course.controller.js";

const router = express.Router();

router.get("/slug/:slug", getCourseBySlug);
router.get("/popular", getPopularCourses);
router.get("/instructor/:instructorId", getCoursesByInstructor);
router.get("/:courseId/learn", getCourseLearningDetail);
router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);

router.post("/", createCourse);
router.put("/:courseId", updateCourse);
router.delete("/:courseId", deleteCourse);

export default router;