import { request } from "../../../services/https";

export const getAllCourses = () => request("/course");

export const getCourseById = (courseId) => request(`/course/${courseId}`);

export const createCourse = (data) =>
  request("/course", { method: "POST", data });

export const updateCourse = (courseId, data) =>
  request(`/course/${courseId}`, { method: "PUT", data });

export const deleteCourse = (courseId) =>
  request(`/course/${courseId}`, { method: "DELETE" });

// Lessons
export const getLessonsByCourse = (courseId) =>
  request(`/api/lesson/course/${courseId}`);

export const createLesson = (data) =>
  request("/api/lesson", { method: "POST", data });

export const updateLesson = (lessonId, data) =>
  request(`/api/lesson/${lessonId}`, { method: "PUT", data });

export const deleteLesson = (lessonId) =>
  request(`/api/lesson/${lessonId}`, { method: "DELETE" });
