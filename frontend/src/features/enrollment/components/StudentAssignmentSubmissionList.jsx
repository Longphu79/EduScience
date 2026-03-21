import React from "react";
import EnrollmentSectionCard from "./EnrollmentSectionCard";
import {
  formatDateTime,
  getSubmissionId,
  getSubmissionStatusMeta,
} from "../utils/enrollment.helpers";

export default function StudentAssignmentSubmissionList({
  assignmentSubmissions = [],
  pageClassName = "",
}) {
  return (
    <EnrollmentSectionCard
      title="Assignment submissions"
      description="Theo dõi bài nộp, điểm số và phản hồi của giảng viên."
      pageClassName={pageClassName}
    >
      {!assignmentSubmissions.length ? (
        <div className={`${pageClassName}__empty-soft`}>
          Chưa có bài nộp assignment.
        </div>
      ) : (
        <div className={`${pageClassName}__stack-list`}>
          {assignmentSubmissions.map((submission, index) => (
            <div
              key={getSubmissionId(submission) || index}
              className={`${pageClassName}__stack-item`}
            >
              <div
                className={`${pageClassName}__stack-row ${pageClassName}__stack-row--top`}
              >
                <div className={`${pageClassName}__stack-main`}>
                  <div className={`${pageClassName}__stack-title`}>
                    {submission?.assignmentId?.title || "Assignment"}
                  </div>

                  <div className={`${pageClassName}__stack-text`}>
                    Grade:{" "}
                    <span className={`${pageClassName}__stack-strong`}>
                      {submission?.grade ?? "Not graded"}
                    </span>
                  </div>

                  <div className={`${pageClassName}__stack-subtext`}>
                    Submitted: {formatDateTime(submission?.submittedAt)}
                  </div>

                  <div className={`${pageClassName}__feedback-box`}>
                    <span className={`${pageClassName}__stack-strong`}>
                      Feedback:
                    </span>{" "}
                    {submission?.feedback || "Chưa có feedback"}
                  </div>
                </div>

                <span
                  className={`${pageClassName}__status ${getSubmissionStatusMeta(
                    submission?.status
                  )}`}
                >
                  {submission?.status || "submitted"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </EnrollmentSectionCard>
  );
}