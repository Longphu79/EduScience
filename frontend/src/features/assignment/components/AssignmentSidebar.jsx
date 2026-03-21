import AssignmentStatusBadge from "./AssignmentStatusBadge";
import {
  getAssignmentId,
  getSubmissionStatusMeta,
} from "../utils/assignment.helpers";
import "../styles/assignment-page.css";
import "../styles/assignment-components.css";

export default function AssignmentSidebar({
  assignments = [],
  selectedAssignmentId = "",
  submissionsMap = {},
  onSelect,
}) {
  return (
    <aside className="assignment-page__sidebar">
      <h2 className="assignment-page__sidebar-title">Danh sách bài tập</h2>

      <div className="assignment-page__sidebar-list">
        {assignments.map((item) => {
          const assignmentId = getAssignmentId(item);
          const isActive = String(selectedAssignmentId) === String(assignmentId);
          const submission = submissionsMap[assignmentId];
          const statusMeta = submission
            ? getSubmissionStatusMeta(submission.status, item.allowResubmit)
            : getSubmissionStatusMeta(null, item.allowResubmit);

          return (
            <button
              key={assignmentId}
              type="button"
              onClick={() => onSelect?.(item)}
              className={`assignment-page__sidebar-item ${
                isActive ? "assignment-page__sidebar-item--active" : ""
              }`}
            >
              <div className="assignment-page__sidebar-item-title">
                {item.title}
              </div>

              <div className="assignment-page__sidebar-item-badge">
                <AssignmentStatusBadge
                  label={statusMeta.label}
                  variant={statusMeta.variant}
                  small
                />
              </div>

              <div className="assignment-page__sidebar-item-score">
                Điểm:
                <span className="assignment-page__sidebar-item-score-value">
                  {" "}
                  {submission?.grade ?? "Chưa chấm"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}