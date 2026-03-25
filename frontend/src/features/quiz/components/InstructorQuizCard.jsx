import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../shared/components/Button";
import { getQuizId } from "../utils/quiz.helpers";

export default function InstructorQuizCard({
  quiz,
  index,
  courseId,
  statusMeta,
  deleting = false,
  publishing = false,
  onTogglePublish,
  onDelete,
}) {
  const quizId = getQuizId(quiz);

  return (
    <div
      className={`rounded-[28px] border p-6 shadow-sm transition-all duration-300 ${statusMeta.cardTone}`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {index + 1}
            </span>

            <h2 className="text-[1.3rem] font-bold text-slate-900">
              {quiz?.title || "Untitled Quiz"}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {quiz?.description || "Chưa có mô tả."}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Questions
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quiz?.questions?.length ?? 0}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Passing
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quiz?.passingScore ?? "N/A"}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Time limit
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quiz?.timeLimit > 0 ? `${quiz.timeLimit} mins` : "N/A"}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Attempts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quiz?.stats?.totalAttempts ?? 0}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Students
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quiz?.stats?.totalStudents ?? 0}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Avg score
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quiz?.stats?.averageScore ?? 0}
              </div>
            </div>

            <div className="rounded-[18px] bg-white/85 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Pass rate
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {quiz?.stats?.passRate ?? 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => onTogglePublish(quiz)}
            loading={publishing}
            disabled={publishing}
          >
            {quiz?.isPublished ? "Unpublish" : "Publish"}
          </Button>

          <Link to={`/instructor/courses/${courseId}/quizzes/${quizId}/edit`}>
            <Button>Edit</Button>
          </Link>

          <Link to={`/instructor/courses/${courseId}/quizzes/${quizId}/results`}>
            <Button type="button">Results</Button>
          </Link>

          <Button
            type="button"
            onClick={() => onDelete(quizId)}
            disabled={deleting}
            loading={deleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}