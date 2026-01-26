import { getPopularCourses } from "../controllers/course.controller.js";
import express from "express";

const router = express.Router();

router.get("/popular", getPopularCourses);

export default router;