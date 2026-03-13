import express from "express";
import {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  submitAssignment,
  resubmitAssignment,
  getStudentSubmissions,
  getSubmissionsByAssignment,
  gradeSubmission,
  updateAssignment,
  deleteAssignment,
} from "./assignment.controller.js";

const router = express.Router();

router.get("/course/:courseId", getAssignmentsByCourse);
router.get("/:assignmentId", getAssignmentById);

router.post("/", createAssignment);
router.put("/:assignmentId", updateAssignment);
router.delete("/:assignmentId", deleteAssignment);

router.post("/:assignmentId/submit", submitAssignment);
router.put("/:assignmentId/resubmit", resubmitAssignment);

router.get("/submission/student/:studentId/course/:courseId", getStudentSubmissions);
router.get("/submission/assignment/:assignmentId", getSubmissionsByAssignment);
router.patch("/submission/:submissionId/grade", gradeSubmission);

export default router;