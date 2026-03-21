import React from "react";
import {
  formatReviewDate,
  getReviewRatingLabel,
} from "../utils/review.helpers";

export default function ReviewItem({ review }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">
            {review?.authorName || "Người dùng"}
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            {formatReviewDate(review?.createdAt)}
          </p>
        </div>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
          {getReviewRatingLabel(review?.rating)}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
        {review?.comment || "Không có nhận xét."}
      </p>
    </div>
  );
}