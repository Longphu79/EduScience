import React from "react";
import { Link } from "react-router-dom";
import { getQuizId } from "../utils/quiz.helpers";

export default function QuizListItem({
  item,
  finalCourseId,
  quizAttempts = [],
  summary,
  statusMeta,
}) {
  const quizId = getQuizId(item);
  const hasAttempt = quizAttempts.length > 0;

  const latestScore =
    summary?.score === 0 || summary?.score ? summary.score : "N/A";

  const latestResult = !hasAttempt
    ? "Chưa làm"
    : summary?.passed
    ? "Đã đạt"
    : "Chưa đạt";

  const latestCorrect = hasAttempt
    ? `${summary?.correctAnswers ?? 0}/${summary?.totalQuestions ?? 0}`
    : "N/A";

  const submittedAt = summary?.submittedAt
    ? new Date(summary.submittedAt).toLocaleString("vi-VN")
    : "N/A";

  const actionText = hasAttempt ? "Retake Quiz" : "Làm quiz";
  const actionLink = hasAttempt
    ? `/learn/${finalCourseId}/quizzes/${quizId}?retake=1`
    : `/learn/${finalCourseId}/quizzes/${quizId}`;

  const badgeText = !hasAttempt
    ? "Chưa làm"
    : summary?.passed
    ? "Đã đạt"
    : "Chưa đạt";

  return (
    <div
      className={`rounded-[28px] border p-5 shadow-sm transition-all duration-300 ${statusMeta.cardTone}`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-[1.25rem] font-bold text-slate-900">
              {item?.title || "Quiz"}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
            >
              {badgeText}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {item?.description || "Chưa có mô tả."}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Questions
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {item?.questions?.length ?? 0}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Passing
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {item?.passingScore ?? 0}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Attempts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quizAttempts.length}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Latest score
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {latestScore}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Result
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {latestResult}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Correct
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {latestCorrect}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {hasAttempt
              ? `Bạn đã làm quiz này ${quizAttempts.length} lần. Lần nộp gần nhất: ${submittedAt}.`
              : "Bạn chưa làm quiz này."}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center rounded-[18px] border border-violet-200 bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            {actionText}
          </Link>
        </div>
      </div>
    </div>
  );
}