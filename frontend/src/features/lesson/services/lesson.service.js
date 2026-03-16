const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

function getAuthToken() {
  try {
    const directToken =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (directToken) return directToken;

    const authRaw =
      localStorage.getItem("auth") ||
      localStorage.getItem("auth-storage") ||
      localStorage.getItem("eduscience_auth");

    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return (
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.state?.token ||
        parsed?.state?.accessToken ||
        null
      );
    }
  } catch (error) {
    console.error("getAuthToken error:", error);
  }

  return null;
}

function createHeaders(extraHeaders = {}, useAuth = false) {
  const headers = {
    ...extraHeaders,
  };

  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse(response, fallbackMessage = "Request failed") {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function lessonUnwrap(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}

export async function getLessonsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/lesson/course/${courseId}`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(response, "Failed to fetch lessons");
}

export async function createLesson(payload) {
  const response = await fetch(`${API_BASE_URL}/lesson`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Failed to create lesson");
}

export async function updateLesson(lessonId, payload) {
  const response = await fetch(`${API_BASE_URL}/lesson/${lessonId}`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Failed to update lesson");
}

export async function deleteLesson(lessonId) {
  const response = await fetch(`${API_BASE_URL}/lesson/${lessonId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });
  return handleResponse(response, "Failed to delete lesson");
}

export const getCourseLessons = getLessonsByCourse;