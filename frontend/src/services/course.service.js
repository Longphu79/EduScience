import { request } from "./request";

export async function getAllCourses(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request(`/course${suffix}`);
}

export async function getPopularCourses() {
  return request("/course/popular");
}

export async function getCourseDetail(courseId) {
  return request(`/course/${courseId}`);
}

export async function getCourseLearningDetail(courseId) {
  return request(`/course/${courseId}/learn`);
}

export async function getCourseBySlug(slug) {
  return request(`/course/slug/${slug}`);
}

export async function enrollCourse({ studentId, courseId }) {
  return request("/enrollment/enroll", {
    method: "POST",
    body: JSON.stringify({ studentId, courseId }),
  });
}

export async function getMyCourses(studentId) {
  return request(`/enrollment/student/${studentId}`);
}

export async function getMyEnrollment(studentId, courseId) {
  return request(`/enrollment/student/${studentId}/course/${courseId}`);
}

export async function getInstructorCourses(instructorId) {
  return request(`/course/instructor/${instructorId}`);
}

export async function completeLesson({ studentId, courseId, lessonId }) {
  return request("/enrollment/complete-lesson", {
    method: "PATCH",
    body: JSON.stringify({ studentId, courseId, lessonId }),
  });
}

export async function setCurrentLesson({ studentId, courseId, lessonId }) {
  return request("/enrollment/current-lesson", {
    method: "PATCH",
    body: JSON.stringify({ studentId, courseId, lessonId }),
  });
}