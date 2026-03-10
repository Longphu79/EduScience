import { uploadToR2 } from "../services/r2.service.js";
import path from "path";

const getExt = (filename) => path.extname(filename).toLowerCase();

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const key = `avatars/${req.user.userId}_${Date.now()}${getExt(req.file.originalname)}`;
    const url = await uploadToR2(req.file.buffer, key, req.file.mimetype);

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadCourseThumbnail = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const key = `courses/thumbnails/${Date.now()}${getExt(req.file.originalname)}`;
    const url = await uploadToR2(req.file.buffer, key, req.file.mimetype);

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadCoursePreview = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const key = `courses/previews/${Date.now()}${getExt(req.file.originalname)}`;
    const url = await uploadToR2(req.file.buffer, key, req.file.mimetype);

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadLessonVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const key = `lessons/${Date.now()}${getExt(req.file.originalname)}`;
    const url = await uploadToR2(req.file.buffer, key, req.file.mimetype);

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
