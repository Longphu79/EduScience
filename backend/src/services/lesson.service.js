import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import {
  assertCourseOwnership,
  assertLessonOwnership,
  canManageCourse,
  getEnrollmentForActor,
} from "./access.service.js";
import { createHttpError } from "../utils/httpError.js";

const pickLessonData = (lessonData = {}) => {
  const allowedFields = [
    "title",
    "description",
    "videoUrl",
    "thumbnail",
    "duration",
    "estimatedCompletionMinutes",
    "order",
    "sectionId",
    "isPreview",
    "isPublished",
    "objectives",
    "notes",
    "resources",
  ];

  return allowedFields.reduce((acc, field) => {
    if (lessonData[field] !== undefined) {
      acc[field] = lessonData[field];
    }

    return acc;
  }, {});
};

const syncCourseLessonMetrics = async (courseId) => {
  const lessons = await Lesson.find({ courseId }).select("duration");
  const totalLessons = lessons.length;
  const duration = lessons.reduce(
    (sum, lesson) => sum + (Number.isFinite(Number(lesson.duration)) ? Number(lesson.duration) : 0),
    0,
  );

  await Course.findByIdAndUpdate(courseId, {
    totalLessons,
    duration,
  });
};

export const createLesson = async (lessonData, actor) => {
  const course = await assertCourseOwnership(lessonData.courseId, actor);

  const lesson = await Lesson.create({
    ...pickLessonData(lessonData),
    courseId: course._id,
  });

  await syncCourseLessonMetrics(course._id);

  return lesson;
};

export const getLessonsByCourse = async (courseId, actor) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  if (await canManageCourse(course, actor)) {
    return await Lesson.find({ courseId }).sort({ order: 1 });
  }

  if (course.status !== "published") {
    throw createHttpError(404, "Course not found");
  }

  const enrollment = await getEnrollmentForActor(courseId, actor);

  if (enrollment) {
    return await Lesson.find({
      courseId,
      isPublished: true,
    }).sort({ order: 1 });
  }

  return await Lesson.find({
    courseId,
    isPreview: true,
    isPublished: true,
  })
    .select(
      "title description duration estimatedCompletionMinutes objectives order isPreview isPublished courseId",
    )
    .sort({ order: 1 });
};

export const getLessonById = async (lessonId, actor) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw createHttpError(404, "Lesson not found");
  }

  const course = await Course.findById(lesson.courseId);

  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  if (await canManageCourse(course, actor)) {
    return lesson;
  }

  if (course.status !== "published") {
    throw createHttpError(404, "Course not found");
  }

  const enrollment = await getEnrollmentForActor(course._id, actor);

  if (enrollment && lesson.isPublished) {
    return lesson;
  }

  if (course.status === "published" && lesson.isPreview && lesson.isPublished) {
    return lesson;
  }

  throw createHttpError(403, "Forbidden");
};

export const updateLesson = async (lessonId, updateData, actor) => {
  const lesson = await assertLessonOwnership(lessonId, actor);

  const updatedLesson = await Lesson.findByIdAndUpdate(
    lessonId,
    pickLessonData(updateData),
    { new: true },
  );

  await syncCourseLessonMetrics(lesson.courseId);

  return updatedLesson;
};

export const deleteLesson = async (lessonId, actor) => {
  await assertLessonOwnership(lessonId, actor);

  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (lesson) {
    await syncCourseLessonMetrics(lesson.courseId);
  }
  return lesson;
};
