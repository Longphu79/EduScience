import {
  normalizeCourseItem,
  normalizeCourseList,
} from "../utils/course.helpers";

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

    if (!authRaw) return null;

    const parsed = JSON.parse(authRaw);
    return (
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.state?.token ||
      parsed?.state?.accessToken ||
      null
    );
  } catch (error) {
    console.error("getAuthToken error:", error);
    return null;
  }
}

function createHeaders(extraHeaders = {}, useAuth = false) {
  const headers = { ...extraHeaders };

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
    const error = new Error(data?.message || fallbackMessage);
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function courseUnwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function mapSortValue(sort) {
  switch (sort) {
    case "popular":
      return "popular";
    case "rating":
    case "highestRated":
      return "rating";
    case "priceAsc":
    case "price-low":
      return "priceAsc";
    case "priceDesc":
    case "price-high":
      return "priceDesc";
    case "newest":
    default:
      return "newest";
  }
}

function normalizeCourseQuery(params = {}) {
  const normalized = { ...params };

  if (!normalized.search || !String(normalized.search).trim()) {
    delete normalized.search;
  } else {
    normalized.search = String(normalized.search).trim();
  }

  if (!normalized.category || normalized.category === "All") {
    delete normalized.category;
  }

  if (!normalized.level || normalized.level === "All") {
    delete normalized.level;
  }

  if (!normalized.pricing || normalized.pricing === "all") {
    delete normalized.pricing;
  }

  if (!normalized.instructorId) {
    delete normalized.instructorId;
  }

  if (
    normalized.minRating === "" ||
    normalized.minRating === undefined ||
    normalized.minRating === null
  ) {
    delete normalized.minRating;
  }

  if (normalized.sortBy || normalized.sort) {
    normalized.sortBy = mapSortValue(normalized.sortBy || normalized.sort);
    delete normalized.sort;
  }

  if (!normalized.page) delete normalized.page;
  if (!normalized.limit) delete normalized.limit;
  if (!normalized.status) delete normalized.status;

  return normalized;
}

function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function sanitizeCoursePayload(payload = {}) {
  const cleanPayload = { ...payload };

  delete cleanPayload.instructorId;
  delete cleanPayload._id;
  delete cleanPayload.id;
  delete cleanPayload.rating;
  delete cleanPayload.totalReviews;
  delete cleanPayload.totalEnrollments;
  delete cleanPayload.analytics;
  delete cleanPayload.createdAt;
  delete cleanPayload.updatedAt;

  if (
    cleanPayload.lessonIds !== undefined &&
    !Array.isArray(cleanPayload.lessonIds)
  ) {
    cleanPayload.lessonIds = [];
  }

  return cleanPayload;
}

export async function getAllCourses(params = {}) {
  const normalized = normalizeCourseQuery(params);
  const queryString = buildQueryString(normalized);

  const res = await fetch(`${API_BASE_URL}/course${queryString}`, {
    method: "GET",
  });

  const payload = await handleResponse(res, "Failed to fetch courses");
  const rawList =
    payload?.data?.courses || payload?.courses || payload?.data || payload || [];
  const pagination =
    payload?.pagination ||
    payload?.data?.pagination || {
      page: 1,
      limit: 9,
      totalItems: Array.isArray(rawList) ? rawList.length : 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

  return {
    data: normalizeCourseList(rawList),
    pagination,
  };
}

export async function getPopularCourses() {
  const res = await fetch(`${API_BASE_URL}/course/popular`, {
    method: "GET",
  });

  const payload = await handleResponse(res, "Failed to fetch popular courses");
  return normalizeCourseList(courseUnwrap(payload));
}

export async function getCourseDetail(courseId) {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  const res = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: "GET",
  });

  const payload = await handleResponse(res, "Failed to fetch course detail");
  return normalizeCourseItem(courseUnwrap(payload));
}

export async function getCourseBySlug(slug) {
  if (!slug) {
    throw new Error("slug is required");
  }

  const res = await fetch(`${API_BASE_URL}/course/slug/${slug}`, {
    method: "GET",
  });

  const payload = await handleResponse(res, "Failed to fetch course by slug");
  return normalizeCourseItem(courseUnwrap(payload));
}

export async function getInstructorCourses(instructorId) {
  if (!instructorId) {
    throw new Error("instructorId is required");
  }

  const res = await fetch(`${API_BASE_URL}/course/instructor/${instructorId}`, {
    method: "GET",
    headers: createHeaders({}, true),
  });

  const payload = await handleResponse(res, "Failed to fetch instructor courses");
  return normalizeCourseList(courseUnwrap(payload));
}

export async function createCourse(payload = {}) {
  const cleanPayload = sanitizeCoursePayload(payload);

  const res = await fetch(`${API_BASE_URL}/course`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(cleanPayload),
  });

  const responsePayload = await handleResponse(res, "Failed to create course");
  return normalizeCourseItem(courseUnwrap(responsePayload));
}

export async function updateCourse(courseId, payload = {}) {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  const cleanPayload = sanitizeCoursePayload(payload);

  const res = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(cleanPayload),
  });

  const responsePayload = await handleResponse(res, "Failed to update course");
  return normalizeCourseItem(courseUnwrap(responsePayload));
}

export async function deleteCourse(courseId) {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  const res = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to delete course");
}

export const getCourseById = getCourseDetail;