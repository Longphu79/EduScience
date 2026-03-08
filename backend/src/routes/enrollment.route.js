import express from "express";
import {
  enrollCourse,
  getMyCourses,
  getInstructorCourses,
  getEnrollmentByStudentAndCourse,
  setCurrentLesson,
  completeLesson,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/enroll", enrollCourse);
router.get("/student/:studentId", getMyCourses);
router.get("/student/:studentId/course/:courseId", getEnrollmentByStudentAndCourse);
router.get("/instructor/:instructorId", getInstructorCourses);
router.patch("/current-lesson", setCurrentLesson);
router.patch("/complete-lesson", completeLesson);

export default router;