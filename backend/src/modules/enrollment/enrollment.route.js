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
} from "./enrollment.controller.js";

const router = express.Router();

router.post("/enroll", enrollCourse);

// student
router.get("/student/:studentId", getMyCourses);
router.get("/student/:studentId/course/:courseId", getEnrollmentByStudentAndCourse);
router.patch("/current-lesson", setCurrentLesson);
router.patch("/complete-lesson", completeLesson);

// instructor
router.get("/instructor/:instructorId", getInstructorCourses);
router.get("/course/:courseId/students", getStudentsByCourse);
router.get("/course/:courseId/student/:studentId/progress", getStudentProgressDetail);

export default router;