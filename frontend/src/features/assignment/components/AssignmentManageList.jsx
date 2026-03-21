import { Link } from "react-router-dom";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import {
  formatDateTimeVN,
  getAssignmentId,
  getAssignmentStatusMeta,
} from "../utils/assignment.helpers";
import "../styles/assignment-components.css";

export default function AssignmentManageList({
  items = [],
  courseId,
  loading = false,
  deletingId = null,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="assignment-manage-list">
        <div className="assignment-manage-list__empty">Đang tải assignment...</div>
      </div>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <div className="assignment-manage-list">
      {items.map((item) => {
        const assignmentId = getAssignmentId(item);
        const statusMeta = getAssignmentStatusMeta(item);

        return (
          <div
            key={assignmentId}
            className={`assignment-manage-list__card ${statusMeta.cardTone}`}
          >
            <div className="assignment-manage-list__content">
              <div className="assignment-manage-list__header">
                <h3 className="assignment-manage-list__title">
                  {item.title || "Untitled Assignment"}
                </h3>

                <AssignmentStatusBadge
                  label={statusMeta.label}
                  variant={statusMeta.variant}
                  small
                />
              </div>

              <p className="assignment-manage-list__description">
                {item.description || "Chưa có mô tả bài tập."}
              </p>

              <div className="assignment-manage-list__meta">
                <span>Hạn nộp: {formatDateTimeVN(item.dueDate)}</span>
                <span>Điểm tối đa: {item.maxScore ?? 100}</span>
                <span>Nộp lại: {item.allowResubmit ? "Có" : "Không"}</span>
              </div>
            </div>

            <div className="assignment-manage-list__actions">
              <button type="button" onClick={() => onEdit?.(item)}>
                Edit
              </button>

              <Link
                to={`/instructor/courses/${courseId}/assignments/${assignmentId}/results`}
              >
                Results
              </Link>

              <button
                type="button"
                onClick={() => onDelete?.(assignmentId)}
                disabled={deletingId === assignmentId}
              >
                {deletingId === assignmentId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}