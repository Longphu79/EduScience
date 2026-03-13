import * as lessonService from "./lesson.service.js";

export const createLesson = async (req, res) => {
  try {
    const data = await lessonService.createLesson(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    const status = err.message === "Course not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const data = await lessonService.updateLesson(req.params.lessonId, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message === "Lesson not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const data = await lessonService.deleteLesson(req.params.lessonId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message === "Lesson not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const data = await lessonService.getLessonsByCourse(req.params.courseId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};