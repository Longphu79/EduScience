import React from "react";

export default function SubmitResultModal({
  open = false,
  summary = null,
  onClose,
  onReview,
}) {
  if (!open || !summary) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-slate-950">
          Nộp bài thành công
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Đây là kết quả tóm tắt của lần làm bài vừa rồi.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Điểm số</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary.score ?? 0}
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Câu đúng</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary.correctAnswers ?? 0}/{summary.totalQuestions ?? 0}
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Kết quả</div>
            <div
              className={`mt-2 text-2xl font-black ${
                summary.passed ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {summary.passed ? "Passed" : "Not passed"}
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Thời gian nộp</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {summary.submittedAt
                ? new Date(summary.submittedAt).toLocaleString("vi-VN")
                : "N/A"}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={onReview}
            className="inline-flex items-center rounded-[18px] bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Xem đáp án
          </button>
        </div>
      </div>
    </div>
  );
}