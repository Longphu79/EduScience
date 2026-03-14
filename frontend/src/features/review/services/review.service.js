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
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function reviewUnwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export async function getReviewsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/review/course/${courseId}`);
  return handleResponse(response, "Failed to fetch reviews");
}

export async function createReview(payload) {
  const response = await fetch(`${API_BASE_URL}/review`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({
      courseId: payload?.courseId,
      rating: payload?.rating,
      comment: payload?.comment,
    }),
  });

  return handleResponse(response, "Failed to create review");
}

export async function updateReview(reviewId, payload) {
  const response = await fetch(`${API_BASE_URL}/review/${reviewId}`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({
      rating: payload?.rating,
      comment: payload?.comment,
    }),
  });

  return handleResponse(response, "Failed to update review");
}

export async function deleteReview(reviewId) {
  const response = await fetch(`${API_BASE_URL}/review/${reviewId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(response, "Failed to delete review");
}

export const getCourseReviews = getReviewsByCourse;