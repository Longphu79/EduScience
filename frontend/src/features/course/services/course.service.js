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

async function handleResponse(res, fallbackMessage = "Request failed") {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function courseUnwrap(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}

function mapSortValue(sort) {
  if (sort === "priceAsc") return "priceAsc";
  if (sort === "priceDesc") return "priceDesc";
  return sort;
}

export async function getAllCourses(params = {}) {
  const normalized = { ...params };

  if (normalized.category === "All") delete normalized.category;
  if (normalized.level === "All") delete normalized.level;

  if (normalized.sortBy) {
    normalized.sortBy = mapSortValue(normalized.sortBy);
  }

  const query = new URLSearchParams(normalized).toString();
  const res = await fetch(`${API_BASE_URL}/course${query ? `?${query}` : ""}`);
  return handleResponse(res, "Failed to fetch courses");
}

export async function getPopularCourses() {
  const res = await fetch(`${API_BASE_URL}/course/popular`);
  return handleResponse(res, "Failed to fetch popular courses");
}

export async function getCourseById(courseId) {
  const res = await fetch(`${API_BASE_URL}/course/${courseId}`);
  return handleResponse(res, "Failed to fetch course detail");
}

export async function getCourseDetail(courseId) {
  const res = await fetch(`${API_BASE_URL}/course/${courseId}`);
  return handleResponse(res, "Failed to fetch course detail");
}

export async function getCourseBySlug(slug) {
  const res = await fetch(`${API_BASE_URL}/course/slug/${slug}`);
  return handleResponse(res, "Failed to fetch course by slug");
}

export async function getInstructorCourses(instructorId) {
  const res = await fetch(`${API_BASE_URL}/course/instructor/${instructorId}`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(res, "Failed to fetch instructor courses");
}

export async function createCourse(payload) {
  const cleanPayload = { ...payload };
  delete cleanPayload.instructorId;
  delete cleanPayload._id;
  delete cleanPayload.rating;
  delete cleanPayload.totalReviews;
  delete cleanPayload.totalEnrollments;

  const res = await fetch(`${API_BASE_URL}/course`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(cleanPayload),
  });

  return handleResponse(res, "Failed to create course");
}

export async function updateCourse(courseId, payload) {
  const cleanPayload = { ...payload };
  delete cleanPayload.instructorId;
  delete cleanPayload._id;
  delete cleanPayload.rating;
  delete cleanPayload.totalReviews;
  delete cleanPayload.totalEnrollments;

  const res = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(cleanPayload),
  });

  return handleResponse(res, "Failed to update course");
}

export async function deleteCourse(courseId) {
  const res = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to delete course");
}