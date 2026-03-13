const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export async function getReviewsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/review/course/${courseId}`);
  return handleResponse(response);
}

export async function createReview(payload) {
  const response = await fetch(`${API_BASE_URL}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateReview(reviewId, payload) {
  const response = await fetch(`${API_BASE_URL}/review/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteReview(reviewId) {
  const response = await fetch(`${API_BASE_URL}/review/${reviewId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export const getCourseReviews = getReviewsByCourse;