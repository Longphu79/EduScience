import AssignmentStatusBadge from "./AssignmentStatusBadge";
import AttachmentList from "./AttachmentList";
import { formatDateTimeVN } from "../utils/assignment.helpers";
import "../styles/assignment-page.css";
import "../styles/assignment-components.css";

export default function AssignmentDetailCard({ assignment }) {
  if (!assignment) return null;

  return (
    <div>
      <div className="assignment-page__heading-row">
        <h2 className="assignment-page__assignment-title">{assignment.title}</h2>

        {assignment.isOverdue ? (
          <AssignmentStatusBadge label="Overdue" variant="overdue" small />
        ) : (
          <AssignmentStatusBadge label="Open" variant="open" small />
        )}
      </div>

      <p className="assignment-page__description">
        {assignment.description || "No description"}
      </p>

      <div className="assignment-page__meta-grid">
        <div className="assignment-page__meta-card">
          <div className="assignment-page__meta-label">Hạn nộp</div>
          <div className="assignment-page__meta-value">
            {formatDateTimeVN(assignment.dueDate)}
          </div>
        </div>

        <div className="assignment-page__meta-card">
          <div className="assignment-page__meta-label">Điểm tối đa</div>
          <div className="assignment-page__meta-value">
            {assignment.maxScore ?? 100}
          </div>
        </div>

        <div className="assignment-page__meta-card">
          <div className="assignment-page__meta-label">Nộp lại</div>
          <div className="assignment-page__meta-value">
            {assignment.allowResubmit ? "Có" : "Không"}
          </div>
        </div>
      </div>

      {assignment.attachmentUrls?.length ? (
        <div className="assignment-page__resource-box">
          <div className="assignment-page__resource-title">
            Tài nguyên bài tập
          </div>
          <AttachmentList
            items={assignment.attachmentUrls}
            fallbackPrefix="Resource"
          />
        </div>
      ) : null}
    </div>
  );
}