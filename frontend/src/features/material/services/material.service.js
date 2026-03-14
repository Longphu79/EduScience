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

export function materialUnwrap(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}

export async function getMaterialsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/material/course/${courseId}`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(response, "Failed to fetch materials");
}

export async function getMaterialsByLesson(lessonId) {
  const response = await fetch(`${API_BASE_URL}/material/lesson/${lessonId}`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(response, "Failed to fetch lesson materials");
}

export async function createMaterial(payload) {
  const response = await fetch(`${API_BASE_URL}/material`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Failed to create material");
}

export async function updateMaterial(materialId, payload) {
  const response = await fetch(`${API_BASE_URL}/material/${materialId}`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Failed to update material");
}

export async function deleteMaterial(materialId) {
  const response = await fetch(`${API_BASE_URL}/material/${materialId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(response, "Failed to delete material");
}

export const getCourseMaterials = getMaterialsByCourse;
export const getLessonMaterials = getMaterialsByLesson;