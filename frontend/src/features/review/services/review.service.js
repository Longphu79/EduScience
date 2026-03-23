import request from "../../../services/https.js";

export async function getReviewsByCourse(courseId) {
  return request.get(`/review/course/${courseId}`);
}

export async function createReview(payload) {
  return request.post(`/review`, {
    courseId: payload?.courseId,
    rating: payload?.rating,
    comment: payload?.comment,
  });
}

export async function updateReview(reviewId, payload) {
  return request.put(`/review/${reviewId}`, {
    rating: payload?.rating,
    comment: payload?.comment,
  });
}

export async function deleteReview(reviewId) {
  return request.delete(`/review/${reviewId}`);
}

export const getCourseReviews = getReviewsByCourse;