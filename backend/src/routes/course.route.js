import { 
    getPopularCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    getAllCourses, 
    getCourseById, 
    getCourseBySlug } from "../controllers/course.controller.js";
import express from "express";
import {
    authMiddleware,
    optionalAuthMiddleware,
    requireRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();    

router.get("/slug/:slug", optionalAuthMiddleware, getCourseBySlug);
router.get("/popular", optionalAuthMiddleware, getPopularCourses);
router.post("/", authMiddleware, requireRoles("instructor", "admin"), createCourse);
router.put("/:courseId", authMiddleware, requireRoles("instructor", "admin"), updateCourse);
router.delete("/:courseId", authMiddleware, requireRoles("instructor", "admin"), deleteCourse);
router.get("/", optionalAuthMiddleware, getAllCourses);
router.get("/:courseId", optionalAuthMiddleware, getCourseById);



export default router;
