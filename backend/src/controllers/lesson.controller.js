import * as lessonService from "../services/lesson.service.js";

export const createLesson = async (req, res) => {
  try {
    const lesson = await lessonService.createLesson(req.body, req.actor);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await lessonService.getLessonsByCourse(
      req.params.courseId,
      req.actor,
    );
    res.status(200).json(lessons);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await lessonService.getLessonById(
      req.params.lessonId,
      req.actor,
    );
    res.status(200).json(lesson);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await lessonService.updateLesson(
      req.params.lessonId,
      req.body,
      req.actor,
    );
    res.status(200).json(lesson);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await lessonService.deleteLesson(req.params.lessonId, req.actor);
    res.status(200).json(lesson);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};
