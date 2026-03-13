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

export function courseUnwrap(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}

function mapSortValue(sort) {
  if (sort === "priceAsc") return "price-low";
  if (sort === "priceDesc") return "price-high";
  return sort;
}

export async function getAllCourses(params = {}) {
  const normalized = { ...params };

  if (normalized.category === "All") delete normalized.category;
  if (normalized.level === "All") delete normalized.level;

  if (normalized.sortBy && !normalized.sort) {
    normalized.sort = mapSortValue(normalized.sortBy);
    delete normalized.sortBy;
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
  const res = await fetch(`${API_BASE_URL}/course/instructor/${instructorId}`);
  return handleResponse(res, "Failed to fetch instructor courses");
}

export async function createCourse(payload) {
  const res = await fetch(`${API_BASE_URL}/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to create course");
}

export async function updateCourse(courseId, payload) {
  const res = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to update course");
}

export async function deleteCourse(courseId) {
  const res = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: "DELETE",
  });
  return handleResponse(res, "Failed to delete course");
}

export async function enrollCourse(payload) {
  const res = await fetch(`${API_BASE_URL}/enrollment/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to enroll course");
}