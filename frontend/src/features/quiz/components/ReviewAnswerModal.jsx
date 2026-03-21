import React from "react";
import QuizResultQuestionReview from "./QuizResultQuestionReview";
import QuizResultSummary from "./QuizResultSummary";

export default function ReviewAnswerModal({
  open = false,
  loading = false,
  reviewData = null,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Review Attempt
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Xem lại đáp án và giải thích chi tiết.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Đang tải review...
            </div>
          ) : !reviewData ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Không có dữ liệu review.
            </div>
          ) : (
            <>
              <QuizResultSummary summary={reviewData} />

              <div className="space-y-4">
                {(reviewData.questionReviews || []).map((question, index) => (
                  <QuizResultQuestionReview
                    key={question?.questionId || index}
                    question={question}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}