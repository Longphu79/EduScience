import express from "express";
import {
    getStudentGamification,
    getStudentGamificationEvents,
    getStudentBadges,
} from "./gamification.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/student/:studentId", verifyToken, getStudentGamification);
router.get(
    "/student/:studentId/events",
    verifyToken,
    getStudentGamificationEvents,
);
router.get("/student/:studentId/badges", verifyToken, getStudentBadges);

export default router;
