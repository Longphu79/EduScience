import { 
    getPopularCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    getAllCourses, 
    getCourseById, 
    getCourseBySlug } from "../controllers/course.controller.js";
import express from "express";

const router = express.Router();    

router.get("/slug/:slug", getCourseBySlug);
router.get("/popular", getPopularCourses);
router.post("/", createCourse);
router.put("/:courseId", updateCourse);
router.delete("/:courseId", deleteCourse);
router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);



export default router;