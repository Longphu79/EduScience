const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export async function getLessonsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/lesson/course/${courseId}`);
  return handleResponse(response);
}

export async function createLesson(payload) {
  const response = await fetch(`${API_BASE_URL}/lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateLesson(lessonId, payload) {
  const response = await fetch(`${API_BASE_URL}/lesson/${lessonId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteLesson(lessonId) {
  const response = await fetch(`${API_BASE_URL}/lesson/${lessonId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export const getCourseLessons = getLessonsByCourse;