function renderStars(rating = 0) {
  const safeRating = Math.max(1, Math.min(5, Number(rating || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

export default function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
        Chưa có đánh giá nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const studentName =
          review.studentId?.fullName ||
          review.studentId?.name ||
          review.studentId?.username ||
          review.studentId?.email ||
          "Student";

        return (
          <div
            key={review._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-bold text-slate-900">
                  {studentName}
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="text-sm font-semibold text-violet-600">
                    Rating: {review.rating || 0}/5
                  </div>
                  <div className="text-sm tracking-wide text-amber-500">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-400">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                  : ""}
              </div>
            </div>

            <p className="mt-3 leading-7 text-slate-600">
              {review.comment || "Không có nội dung đánh giá."}
            </p>
          </div>
        );
      })}
    </div>
  );
}