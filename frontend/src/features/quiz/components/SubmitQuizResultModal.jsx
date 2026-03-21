import React from "react";
import Button from "../../../shared/components/Button";
import QuizResultSummary from "./QuizResultSummary";

export default function SubmitQuizResultModal({
  open = false,
  summary = null,
  onClose,
  onViewAnswers,
  onRetake,
  onBackToList,
}) {
  if (!open || !summary) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-4xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Kết quả bài quiz
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Bài đã được nộp thành công. Đáp án chi tiết chỉ hiển thị khi bạn bấm
              xem đáp án.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <div className="p-6">
          <QuizResultSummary summary={summary} />

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={onViewAnswers}>
              Xem đáp án
            </Button>

            <Button type="button" variant="secondary" onClick={onRetake}>
              Làm lại quiz
            </Button>

            <Button type="button" variant="secondary" onClick={onBackToList}>
              Quay lại danh sách quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}