import React from "react";
import Button from "../../../shared/components/Button";
import { getAttemptId } from "../utils/quiz.helpers";

export default function StudentAttemptsPanel({
  open = false,
  attemptsLoading = false,
  studentAttempts = [],
  onOpenReview,
}) {
  if (!open) return null;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        Attempts of selected student
      </h2>

      {attemptsLoading ? (
        <div className="text-slate-500">Đang tải attempts...</div>
      ) : studentAttempts.length === 0 ? (
        <div className="text-slate-500">Không có attempt nào.</div>
      ) : (
        <div className="grid gap-4">
          {studentAttempts.map((attempt) => (
            <div
              key={getAttemptId(attempt)}
              className="rounded-[22px] border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="text-base font-bold text-slate-900">
                    Score: {attempt?.score ?? 0}
                  </div>
                  <div>
                    Correct: {attempt?.correctAnswers ?? 0}/
                    {attempt?.totalQuestions ?? 0}
                  </div>
                  <div>
                    Result:{" "}
                    <span
                      className={
                        attempt?.passed
                          ? "font-semibold text-emerald-600"
                          : "font-semibold text-red-500"
                      }
                    >
                      {attempt?.passed ? "Passed" : "Not passed"}
                    </span>
                  </div>
                  <div>
                    Submitted:{" "}
                    {attempt?.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleString("vi-VN")
                      : "N/A"}
                  </div>
                </div>

                <div>
                  <Button
                    type="button"
                    onClick={() => onOpenReview(getAttemptId(attempt))}
                  >
                    Review Attempt
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}