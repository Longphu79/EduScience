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

export const createLesson = async (payload) => {
  const course = await Course.findById(payload.courseId);
  if (!course) throw new Error("Course not found");

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

export const updateLesson = async (lessonId, payload) => {
  const updatePayload = { ...payload };

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

  const lesson = await Lesson.findByIdAndUpdate(lessonId, updatePayload, {
    new: true,
  });

  if (!lesson) throw new Error("Lesson not found");
  return lesson;
};

export const deleteLesson = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  await Lesson.findByIdAndDelete(lessonId);

  await Course.findByIdAndUpdate(lesson.courseId, {
    $pull: { lessonIds: lesson._id },
    $inc: { totalLessons: -1 },
  });

  return { success: true };
};

export const getLessonsByCourse = async (courseId) => {
  return Lesson.find({ courseId }).sort({ order: 1, createdAt: 1 });
};