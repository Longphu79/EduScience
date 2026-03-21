import { request } from "../../../services/https.js";

export async function getReviewsByCourse(courseId) {
  return request(`/review/course/${courseId}`, {
    method: "GET",
  });
}

export async function createReview(payload) {
  return request(`/review`, {
    method: "POST",
    body: JSON.stringify({
      courseId: payload?.courseId,
      rating: payload?.rating,
      comment: payload?.comment,
    }),
  });
}

export async function updateReview(reviewId, payload) {
  return request(`/review/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify({
      rating: payload?.rating,
      comment: payload?.comment,
    }),
  });
}

export async function deleteReview(reviewId) {
  return request(`/review/${reviewId}`, {
    method: "DELETE",
  });
}

export const getCourseReviews = getReviewsByCourse;