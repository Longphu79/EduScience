import AssignmentStatusBadge from "./AssignmentStatusBadge";
import AttachmentList from "./AttachmentList";
import { getLatestSubmissionInfo } from "../utils/assignment.helpers";
import "../styles/assignment-page.css";
import "../styles/assignment-components.css";

export default function AssignmentSubmissionSummary({
  submission,
  assignment,
  statusMeta,
}) {
  if (!submission || !assignment || !statusMeta) return null;

  return (
    <div className="assignment-page__submission-box">
      <div className="assignment-page__submission-header">
        <h3 className="assignment-page__section-title">Bài nộp của bạn</h3>

        <AssignmentStatusBadge
          label={statusMeta.label}
          variant={statusMeta.variant}
          small
        />
      </div>

      <div className="assignment-page__meta-grid">
        <div className="assignment-page__meta-card">
          <div className="assignment-page__meta-label">Điểm</div>
          <div className="assignment-page__meta-value">
            {submission.grade != null
              ? `${submission.grade}/${assignment.maxScore ?? 100}`
              : "Chưa chấm"}
          </div>
        </div>

        <div className="assignment-page__meta-card assignment-page__meta-card--wide">
          <div className="assignment-page__meta-label">Lần nộp gần nhất</div>
          <div className="assignment-page__meta-value">
            {getLatestSubmissionInfo(submission)}
          </div>
        </div>
      </div>

      <div className="assignment-page__info-box">
        <div className="assignment-page__info-title">Feedback từ instructor</div>
        <div className="assignment-page__info-text">
          {submission.feedback || "Chưa có feedback"}
        </div>
      </div>

      {submission.submissionText ? (
        <div className="assignment-page__info-box">
          <div className="assignment-page__info-title">Nội dung đã nộp</div>
          <div className="assignment-page__info-text assignment-page__info-text--pre">
            {submission.submissionText}
          </div>
        </div>
      ) : null}

      {submission.fileUrls?.length ? (
        <div className="assignment-page__info-box">
          <div className="assignment-page__info-title">File đã nộp</div>
          <AttachmentList
            items={submission.fileUrls}
            fallbackPrefix="Submitted File"
          />
        </div>
      ) : null}
    </div>
  );
}