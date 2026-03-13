const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

async function handleResponse(res, fallbackMessage) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || fallbackMessage);
  }
  return data;
}

export async function enrollCourse(payload) {
  const res = await fetch(`${API_BASE_URL}/enrollment/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to enroll course");
}

export async function getMyCourses(studentId) {
  const res = await fetch(`${API_BASE_URL}/enrollment/student/${studentId}`);
  return handleResponse(res, "Failed to fetch my courses");
}

export async function getStudentEnrollments(studentId) {
  const res = await fetch(`${API_BASE_URL}/enrollment/student/${studentId}`);
  return handleResponse(res, "Failed to fetch student enrollments");
}

export async function getEnrollmentByStudentAndCourse(courseId, studentId) {
  const res = await fetch(
    `${API_BASE_URL}/enrollment/student/${studentId}/course/${courseId}`
  );
  return handleResponse(res, "Failed to fetch enrollment");
}

export async function setCurrentLesson(payload) {
  const res = await fetch(`${API_BASE_URL}/enrollment/current-lesson`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to set current lesson");
}

export async function completeLesson(payload) {
  const res = await fetch(`${API_BASE_URL}/enrollment/complete-lesson`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to complete lesson");
}

export async function getStudentsByCourse(courseId) {
  const res = await fetch(`${API_BASE_URL}/enrollment/course/${courseId}/students`);
  return handleResponse(res, "Failed to fetch students by course");
}

export async function getInstructorCourses(instructorId) {
  const res = await fetch(`${API_BASE_URL}/enrollment/instructor/${instructorId}`);
  return handleResponse(res, "Failed to fetch instructor courses");
}