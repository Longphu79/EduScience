import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { avatarUpload, thumbnailUpload, videoUpload } from "../middleware/upload.js";
import {
  uploadAvatar,
  uploadCourseThumbnail,
  uploadCoursePreview,
  uploadLessonVideo,
} from "../controllers/upload.controller.js";

const router = Router();

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

router.post("/avatar", authMiddleware, handleMulter(avatarUpload.single("file")), uploadAvatar);
router.post("/course-thumbnail", authMiddleware, handleMulter(thumbnailUpload.single("file")), uploadCourseThumbnail);
router.post("/course-preview", authMiddleware, handleMulter(videoUpload.single("file")), uploadCoursePreview);
router.post("/lesson-video", authMiddleware, handleMulter(videoUpload.single("file")), uploadLessonVideo);

export default router;
