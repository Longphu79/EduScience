import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import ReviewList from "../components/ReviewList";
import { getReviewsByCourse } from "../services/review.service";
import { normalizeReviewList } from "../utils/review.helpers";
import "../styles/course-reviews-page.css";

export default function CourseReviewsPage() {
  const { courseId } = useParams();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const loadReviews = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const response = await getReviewsByCourse(courseId);
      setReviews(normalizeReviewList(response));
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được đánh giá",
        kind: "error",
      });
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="course-reviews-page">
      <div className="course-reviews-page__container">
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Đang tải đánh giá...
          </div>
        ) : (
          <ReviewList reviews={reviews} />
        )}
      </div>
    </div>
  );
}