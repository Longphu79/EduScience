import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";

export const createLesson = async (lessonData) => {
  const lesson = await Lesson.create(lessonData);
  await Course.findByIdAndUpdate(lessonData.courseId, {
    $inc: { totalLessons: 1 },
  });
  return lesson;
};

export const getLessonsByCourse = async (courseId) => {
  return await Lesson.find({ courseId }).sort({ order: 1 });
};

export const getLessonById = async (lessonId) => {
  return await Lesson.findById(lessonId);
};

export const updateLesson = async (lessonId, updateData) => {
  return await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true });
};

export const deleteLesson = async (lessonId) => {
  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (lesson) {
    await Course.findByIdAndUpdate(lesson.courseId, {
      $inc: { totalLessons: -1 },
    });
  }
  return lesson;
};
