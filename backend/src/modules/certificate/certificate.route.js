import express from "express";
import {
  generateCertificate,
  getCertificateByCourseStudent,
  getCertificateById,
  getCertificateByCode,
} from "./certificate.controller.js";

const router = express.Router();

router.post("/generate", generateCertificate);
router.get("/course/:courseId/student/:studentId", getCertificateByCourseStudent);
router.get("/public/:code", getCertificateByCode);
router.get("/:certificateId", getCertificateById);

export default router;