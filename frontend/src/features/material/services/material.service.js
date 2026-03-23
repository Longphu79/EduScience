const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

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

async function parseJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return response.json().catch(() => null);
}

async function handleResponse(response, fallbackMessage = "Request failed") {
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

async function apiRequest(
  path,
  options = {},
  fallbackMessage = "Request failed"
) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  return handleResponse(response, fallbackMessage);
}

export async function uploadMaterialFile(file) {
  if (!file) {
    throw new Error("File is required");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/material`, {
    method: "POST",
    headers: createHeaders({}, true),
    body: formData,
  });

  return handleResponse(response, "Failed to upload file");
}

export async function getMaterialsByCourse(courseId) {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  return apiRequest(
    `/material/course/${courseId}`,
    {
      headers: createHeaders({}, true),
    },
    "Failed to fetch materials"
  );
}

export async function getMaterialsByLesson(lessonId) {
  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  return apiRequest(
    `/material/lesson/${lessonId}`,
    {
      headers: createHeaders({}, true),
    },
    "Failed to fetch lesson materials"
  );
}

export async function createMaterial(payload) {
  return apiRequest(
    "/material",
    {
      method: "POST",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
      body: JSON.stringify(payload),
    },
    "Failed to create material"
  );
}

export async function updateMaterial(materialId, payload) {
  if (!materialId) {
    throw new Error("materialId is required");
  }

  return apiRequest(
    `/material/${materialId}`,
    {
      method: "PUT",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
      body: JSON.stringify(payload),
    },
    "Failed to update material"
  );
}

export async function deleteMaterial(materialId) {
  if (!materialId) {
    throw new Error("materialId is required");
  }

  return apiRequest(
    `/material/${materialId}`,
    {
      method: "DELETE",
      headers: createHeaders({}, true),
    },
    "Failed to delete material"
  );
}

export const getCourseMaterials = getMaterialsByCourse;
export const getLessonMaterials = getMaterialsByLesson;