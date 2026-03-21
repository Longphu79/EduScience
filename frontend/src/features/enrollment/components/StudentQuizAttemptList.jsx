import React from "react";
import EnrollmentSectionCard from "./EnrollmentSectionCard";
import {
  formatDateTime,
  getQuizAttemptId,
} from "../utils/enrollment.helpers";

export default function StudentQuizAttemptList({
  quizAttempts = [],
  pageClassName = "",
}) {
  return (
    <EnrollmentSectionCard
      title="Quiz attempts"
      description="Lịch sử làm quiz, điểm số và trạng thái đạt/chưa đạt."
      pageClassName={pageClassName}
    >
      {!quizAttempts.length ? (
        <div className={`${pageClassName}__empty-soft`}>
          Chưa có lượt làm quiz.
        </div>
      ) : (
        <div className={`${pageClassName}__stack-list`}>
          {quizAttempts.map((attempt, index) => (
            <div
              key={getQuizAttemptId(attempt) || index}
              className={`${pageClassName}__stack-item`}
            >
              <div className={`${pageClassName}__stack-row`}>
                <div className={`${pageClassName}__stack-main`}>
                  <div className={`${pageClassName}__stack-title`}>
                    {attempt?.quizId?.title || "Quiz"}
                  </div>

                  <div className={`${pageClassName}__stack-text`}>
                    Score:{" "}
                    <span className={`${pageClassName}__stack-strong`}>
                      {attempt?.score || 0}
                    </span>{" "}
                    | Correct:{" "}
                    <span className={`${pageClassName}__stack-strong`}>
                      {attempt?.correctAnswers || 0}/
                      {attempt?.totalQuestions || 0}
                    </span>
                  </div>

                  <div className={`${pageClassName}__stack-subtext`}>
                    Submitted: {formatDateTime(attempt?.submittedAt)}
                  </div>
                </div>

                <span
                  className={`${pageClassName}__status ${
                    attempt?.passed
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-rose-100 text-rose-700 border border-rose-200"
                  }`}
                >
                  {attempt?.passed ? "Passed" : "Not passed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </EnrollmentSectionCard>
  );
}