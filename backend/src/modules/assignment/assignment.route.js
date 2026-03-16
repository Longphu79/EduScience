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
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

router.get("/course/:courseId", verifyToken, getAssignmentsByCourse);
router.get("/:assignmentId", verifyToken, getAssignmentById);

router.post("/", verifyToken, createAssignment);
router.put("/:assignmentId", verifyToken, updateAssignment);
router.delete("/:assignmentId", verifyToken, deleteAssignment);

router.post("/:assignmentId/submit", verifyToken, submitAssignment);
router.put("/:assignmentId/resubmit", verifyToken, resubmitAssignment);

router.get(
  "/submission/student/:studentId/course/:courseId",
  verifyToken,
  getStudentSubmissions
);
router.get(
  "/submission/assignment/:assignmentId",
  verifyToken,
  getSubmissionsByAssignment
);
router.patch("/submission/:submissionId/grade", verifyToken, gradeSubmission);

export default router;