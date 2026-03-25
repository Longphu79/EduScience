import request from "../../../services/https.js";

export async function getReviewsByCourse(courseId) {
    return request.get(`/api/review/course/${courseId}`);
}

export async function createReview(payload) {
    return request.post(`/api/review`, {
        courseId: payload?.courseId,
        rating: payload?.rating,
        comment: payload?.comment,
    });
}

export async function updateReview(reviewId, payload) {
    return request.put(`/api/review/${reviewId}`, {
        rating: payload?.rating,
        comment: payload?.comment,
    });
}

export async function deleteReview(reviewId) {
    return request.delete(`/api/review/${reviewId}`);
}

export const getCourseReviews = getReviewsByCourse;
