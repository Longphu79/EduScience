import React from "react";
import { formatTime } from "../utils/quiz.helpers";

export default function QuizPageHero({
  title = "Quiz",
  description = "Hoàn thành bài kiểm tra để đánh giá tiến độ học tập của bạn.",
  quiz,
  attempts = [],
  latestAttempt,
  timeLeft,
  onBackToQuizzes,
  onBackToCourse,
}) {
  return (
    <>
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[2rem] font-black tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBackToQuizzes}
              className="inline-flex items-center justify-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Back to Quizzes
            </button>

            <button
              type="button"
              onClick={onBackToCourse}
              className="inline-flex items-center justify-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Back to Learn Course
            </button>
          </div>
        </div>
      </div>

      {quiz ? (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[1.9rem] font-black tracking-tight text-slate-950">
                  {quiz.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {quiz.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                    Questions: {quiz.questions?.length || 0}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                    Passing: {quiz.passingScore || 0}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                    Attempts: {attempts.length}
                  </span>
                </div>
              </div>

              {timeLeft !== null ? (
                <div className="rounded-[22px] border border-indigo-100 bg-indigo-50 px-5 py-4 text-center">
                  <div className="text-sm text-slate-500">Time left</div>
                  <div className="text-2xl font-black text-indigo-700">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              ) : null}
            </div>

            {latestAttempt ? (
              <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="mb-2 font-bold text-slate-900">
                  Latest attempt
                </div>
                <div>Score: {latestAttempt.score ?? 0}</div>
                <div>
                  Correct: {latestAttempt.correctAnswers ?? 0}/
                  {latestAttempt.totalQuestions ?? 0}
                </div>
                <div>
                  Status:{" "}
                  <span
                    className={
                      latestAttempt.passed
                        ? "font-semibold text-emerald-600"
                        : "font-semibold text-red-500"
                    }
                  >
                    {latestAttempt.passed ? "Passed" : "Not passed"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}