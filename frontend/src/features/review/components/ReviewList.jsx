import React from "react";
import ReviewEmptyState from "./ReviewEmptyState";
import ReviewItem from "./ReviewItem";
import {
  getReviewId,
  normalizeReviewList,
} from "../utils/review.helpers";

export default function ReviewList({
  reviews = [],
  emptyTitle = "Chưa có đánh giá nào",
  emptyDescription = "Hãy là người đầu tiên để lại nhận xét cho khóa học này.",
}) {
  const normalizedReviews = normalizeReviewList(reviews);

  if (!normalizedReviews.length) {
    return (
      <ReviewEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {normalizedReviews.map((review, index) => (
        <ReviewItem key={getReviewId(review) || index} review={review} />
      ))}
    </div>
  );
}