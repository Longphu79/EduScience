import Button from "../../../shared/components/Button";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import AttachmentList from "./AttachmentList";
import {
  getLatestSubmissionInfo,
  getStudentDisplayName,
  getStudentEmail,
  getSubmissionStatusMeta,
} from "../utils/assignment.helpers";

export default function SubmissionResultCard({
  submission,
  maxScore = 100,
  onGrade,
}) {
  const statusMeta = getSubmissionStatusMeta(submission?.status);
  const studentName = getStudentDisplayName(submission);
  const studentEmail = getStudentEmail(submission);
  const submittedAt = getLatestSubmissionInfo(submission);

  return (
    <div className="instructor-assignment-results-page__card">
      <div className="instructor-assignment-results-page__card-layout">
        <div className="instructor-assignment-results-page__content">
          <div className="instructor-assignment-results-page__card-header">
            <h3 className="instructor-assignment-results-page__student-name">
              {studentName}
            </h3>

            <AssignmentStatusBadge
              label={statusMeta.label}
              variant={statusMeta.variant}
              small
            />
          </div>

          <div className="instructor-assignment-results-page__meta-grid">
            <div className="instructor-assignment-results-page__meta-card">
              <div className="instructor-assignment-results-page__meta-label">
                Email
              </div>
              <div className="instructor-assignment-results-page__meta-value instructor-assignment-results-page__meta-value--break">
                {studentEmail}
              </div>
            </div>

            <div className="instructor-assignment-results-page__meta-card">
              <div className="instructor-assignment-results-page__meta-label">
                Score
              </div>
              <div className="instructor-assignment-results-page__meta-value">
                {submission?.grade ?? "Not graded"} / {maxScore}
              </div>
            </div>

            <div className="instructor-assignment-results-page__meta-card">
              <div className="instructor-assignment-results-page__meta-label">
                Submitted
              </div>
              <div className="instructor-assignment-results-page__meta-value">
                {submittedAt}
              </div>
            </div>

            <div className="instructor-assignment-results-page__meta-card">
              <div className="instructor-assignment-results-page__meta-label">
                Feedback
              </div>
              <div className="instructor-assignment-results-page__meta-value">
                {submission?.feedback || "No feedback yet"}
              </div>
            </div>
          </div>

          {submission?.submissionText ? (
            <div className="instructor-assignment-results-page__text-box">
              {submission.submissionText}
            </div>
          ) : null}

          {submission?.fileUrls?.length ? (
            <div className="instructor-assignment-results-page__files">
              <AttachmentList
                items={submission.fileUrls}
                fallbackPrefix="Submitted File"
              />
            </div>
          ) : null}
        </div>

        <div className="instructor-assignment-results-page__actions">
          <Button type="button" onClick={() => onGrade?.(submission)}>
            {submission?.status === "graded" ? "Re-grade" : "Grade"}
          </Button>
        </div>
      </div>
    </div>
  );
}