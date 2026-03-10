import * as lessonService from "../services/lesson.service.js";

export const createLesson = async (req, res) => {
  try {
    const lesson = await lessonService.createLesson(req.body);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await lessonService.getLessonsByCourse(req.params.courseId);
    res.status(200).json(lessons);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.lessonId);
    res.status(200).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await lessonService.updateLesson(req.params.lessonId, req.body);
    res.status(200).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await lessonService.deleteLesson(req.params.lessonId);
    res.status(200).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
