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
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { assignmentUploadFields } from "./assignment.upload.js";
import {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateSubmitAssignment,
} from "./assignment.validation.js";

const router = express.Router();

router.get("/course/:courseId", verifyToken, getAssignmentsByCourse);
router.get("/:assignmentId", verifyToken, getAssignmentById);

router.post(
  "/",
  verifyToken,
  assignmentUploadFields,
  validateCreateAssignment,
  createAssignment
);

router.put(
  "/:assignmentId",
  verifyToken,
  assignmentUploadFields,
  validateUpdateAssignment,
  updateAssignment
);

router.delete("/:assignmentId", verifyToken, deleteAssignment);

router.post(
  "/:assignmentId/submit",
  verifyToken,
  assignmentUploadFields,
  validateSubmitAssignment,
  submitAssignment
);

router.put(
  "/:assignmentId/resubmit",
  verifyToken,
  assignmentUploadFields,
  validateSubmitAssignment,
  resubmitAssignment
);

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