import React from "react";

export default function QuizResultSummary({ summary }) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-4">
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm text-slate-500">Điểm số</div>
        <div className="mt-2 text-3xl font-black text-slate-900">
          {summary.score}
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm text-slate-500">Câu đúng</div>
        <div className="mt-2 text-3xl font-black text-slate-900">
          {summary.correctAnswers}/{summary.totalQuestions}
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm text-slate-500">Kết quả</div>
        <div
          className={`mt-2 text-2xl font-black ${
            summary.passed ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {summary.passed ? "Passed" : "Not passed"}
        </div>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm text-slate-500">Thời gian nộp</div>
        <div className="mt-2 text-sm font-semibold text-slate-900">
          {summary.submittedAt
            ? new Date(summary.submittedAt).toLocaleString("vi-VN")
            : "N/A"}
        </div>
      </div>
    </div>
  );
}