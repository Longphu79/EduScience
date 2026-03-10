import { request } from "../../../services/https";

const uploadFile = (endpoint, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return request(endpoint, { method: "POST", data: formData });
};

export const uploadAvatar = (file) => uploadFile("/api/upload/avatar", file);
export const uploadCourseThumbnail = (file) => uploadFile("/api/upload/course-thumbnail", file);
export const uploadCoursePreview = (file) => uploadFile("/api/upload/course-preview", file);
export const uploadLessonVideo = (file) => uploadFile("/api/upload/lesson-video", file);
