import Lesson from "./lesson.model.js";
import Course from "../course/course.model.js";

function convertYoutubeToEmbed(url = "") {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return url;
}

async function ensureCourseOwnership(courseId, { requesterId, requesterRole } = {}) {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(course.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to modify lessons of this course");
  }

  return course;
}

async function ensureLessonOwnership(lessonId, { requesterId, requesterRole } = {}) {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const course = await Course.findById(lesson.courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(course.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to modify this lesson");
  }

  return { lesson, course };
}

export const createLesson = async (payload, { requesterId, requesterRole } = {}) => {
  if (!payload?.courseId) {
    throw new Error("courseId is required");
  }

  await ensureCourseOwnership(payload.courseId, { requesterId, requesterRole });

  const lesson = await Lesson.create({
    title: payload.title?.trim() || "",
    description: payload.description?.trim() || "",
    videoUrl: convertYoutubeToEmbed(payload.videoUrl),
    materialUrl: payload.materialUrl?.trim() || "",
    duration: Number(payload.duration) || 0,
    order: Number(payload.order) || 1,
    sectionId: payload.sectionId || null,
    courseId: payload.courseId,
    isPreview: !!payload.isPreview,
    isPublished:
      typeof payload.isPublished === "boolean" ? payload.isPublished : true,
  });

  await Course.findByIdAndUpdate(payload.courseId, {
    $addToSet: { lessonIds: lesson._id },
    $inc: { totalLessons: 1 },
  });

  return lesson;
};

export const updateLesson = async (
  lessonId,
  payload,
  { requesterId, requesterRole } = {}
) => {
  const { lesson } = await ensureLessonOwnership(lessonId, {
    requesterId,
    requesterRole,
  });

  const updatePayload = { ...payload };

  delete updatePayload._id;
  delete updatePayload.courseId;

  if (payload.videoUrl) {
    updatePayload.videoUrl = convertYoutubeToEmbed(payload.videoUrl);
  }

  if (typeof payload.title === "string") {
    updatePayload.title = payload.title.trim();
  }

  if (typeof payload.description === "string") {
    updatePayload.description = payload.description.trim();
  }

  if (typeof payload.materialUrl === "string") {
    updatePayload.materialUrl = payload.materialUrl.trim();
  }

  if (payload.duration !== undefined) {
    updatePayload.duration = Number(payload.duration) || 0;
  }

  if (payload.order !== undefined) {
    updatePayload.order = Number(payload.order) || 1;
  }

  if (payload.isPreview !== undefined) {
    updatePayload.isPreview = !!payload.isPreview;
  }

  if (payload.isPublished !== undefined) {
    updatePayload.isPublished = !!payload.isPublished;
  }

  const updatedLesson = await Lesson.findByIdAndUpdate(lesson._id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!updatedLesson) {
    throw new Error("Lesson not found");
  }

  return updatedLesson;
};

export const deleteLesson = async (
  lessonId,
  { requesterId, requesterRole } = {}
) => {
  const { lesson } = await ensureLessonOwnership(lessonId, {
    requesterId,
    requesterRole,
  });

  await Lesson.findByIdAndDelete(lessonId);

  await Course.findByIdAndUpdate(lesson.courseId, {
    $pull: { lessonIds: lesson._id },
    $inc: { totalLessons: -1 },
  });

  return { success: true };
};

export const getLessonsByCourse = async (courseId) => {
  return await Lesson.find({ courseId }).sort({ order: 1, createdAt: 1 });
};