import express from "express";
import {
  enrollCourse,
  getMyCourses,
  getInstructorCourses,
  getEnrollmentByStudentAndCourse,
  setCurrentLesson,
  completeLesson,
  getStudentsByCourse,
  getStudentProgressDetail,
  getStudentDashboardSummary,
  getInstructorDashboardSummary,
} from "./enrollment.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/enroll", verifyToken, enrollCourse);

router.get("/dashboard/student/:studentId", verifyToken, getStudentDashboardSummary);
router.get(
  "/dashboard/instructor/:instructorId",
  verifyToken,
  getInstructorDashboardSummary
);

router.get("/student/:studentId", verifyToken, getMyCourses);
router.get(
  "/student/:studentId/course/:courseId",
  verifyToken,
  getEnrollmentByStudentAndCourse
);
router.patch("/current-lesson", verifyToken, setCurrentLesson);
router.patch("/complete-lesson", verifyToken, completeLesson);

router.get("/instructor/:instructorId", verifyToken, getInstructorCourses);
router.get("/course/:courseId/students", verifyToken, getStudentsByCourse);
router.get(
  "/course/:courseId/student/:studentId/progress",
  verifyToken,
  getStudentProgressDetail
);

export default router;