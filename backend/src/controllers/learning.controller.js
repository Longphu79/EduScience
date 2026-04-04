import * as learningService from "../services/learning.service.js";
import * as reminderService from "../services/reminder.service.js";

export const getMyCourses = async (req, res) => {
  try {
    const courses = await learningService.getMyCourses(req.actor);
    res.status(200).json(courses);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getLearningCourseBySlug = async (req, res) => {
  try {
    const course = await learningService.getLearningCourseBySlug(
      req.params.slug,
      req.actor,
    );
    res.status(200).json(course);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const updateLessonProgress = async (req, res) => {
  try {
    const progress = await learningService.updateLessonProgress(
      req.params.courseId,
      req.params.lessonId,
      req.actor,
      req.body?.completed !== false,
    );
    res.status(200).json(progress);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const updateLessonNotebook = async (req, res) => {
  try {
    const notebook = await learningService.upsertLessonNotebook(
      req.params.courseId,
      req.params.lessonId,
      req.actor,
      req.body,
    );
    res.status(200).json(notebook);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const upsertCourseReview = async (req, res) => {
  try {
    const review = await learningService.upsertCourseReview(
      req.params.courseId,
      req.actor,
      req.body,
    );
    res.status(200).json(review);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const listReminders = async (req, res) => {
  try {
    const reminders = await reminderService.listRemindersForStudent(req.actor);
    res.status(200).json(reminders);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const createReminder = async (req, res) => {
  try {
    const reminder = await reminderService.createReminder(
      req.params.courseId,
      req.body.remindAt,
      req.body.message,
      req.actor,
    );
    res.status(201).json(reminder);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};
