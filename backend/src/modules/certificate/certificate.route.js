import express from "express";
import {
  generateCertificate,
  getCertificateByCourseStudent,
  getCertificateById,
  getCertificateByCode,
} from "./certificate.controller.js";
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

router.post("/generate", verifyToken, generateCertificate);
router.get(
  "/course/:courseId/student/:studentId",
  verifyToken,
  getCertificateByCourseStudent
);
router.get("/public/:code", getCertificateByCode);
router.get("/:certificateId", verifyToken, getCertificateById);

export default router;