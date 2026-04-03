import express from "express";
import multer from "multer";
import {
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonsByCourse,
    uploadLessonVideo,
} from "./lesson.controller.js";
import { videoUpload } from "../../middlewares/upload.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
const router = express.Router();

// Wrap multer middleware to catch errors and return JSON
const handleMulter = (uploadMiddleware) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        }
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.get("/course/:courseId", getLessonsByCourse);
router.post("/", verifyToken, createLesson);
router.put("/:lessonId", verifyToken, updateLesson);
router.delete("/:lessonId", verifyToken, deleteLesson);
router.post(
    "/lesson-video",
    verifyToken,
    handleMulter(videoUpload.single("file")),
    uploadLessonVideo,
);

export default router;
