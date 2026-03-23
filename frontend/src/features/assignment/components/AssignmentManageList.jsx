import { Link } from "react-router-dom";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import AttachmentList from "./AttachmentList";
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
        <div className="assignment-manage-list__empty">
          Đang tải assignment...
        </div>
      </div>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <div className="assignment-manage-list">
      {items.map((item, index) => {
        const assignmentId = getAssignmentId(item);
        const statusMeta = getAssignmentStatusMeta(item);

        return (
          <div
            key={assignmentId}
            className={`assignment-manage-list__card assignment-manage-list__card--${statusMeta.variant}`}
          >
            <div className="assignment-manage-list__card-layout">
              <div className="assignment-manage-list__content">
                <div className="assignment-manage-list__header">
                  <div className="assignment-manage-list__index">
                    {index + 1}
                  </div>

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

                <div className="assignment-manage-list__meta-grid">
                  <div className="assignment-manage-list__meta-card">
                    <div className="assignment-manage-list__meta-label">
                      Hạn nộp
                    </div>
                    <div className="assignment-manage-list__meta-value">
                      {formatDateTimeVN(item.dueDate)}
                    </div>
                  </div>

                  <div className="assignment-manage-list__meta-card">
                    <div className="assignment-manage-list__meta-label">
                      Điểm tối đa
                    </div>
                    <div className="assignment-manage-list__meta-value">
                      {item.maxScore ?? 100}
                    </div>
                  </div>

                  <div className="assignment-manage-list__meta-card">
                    <div className="assignment-manage-list__meta-label">
                      Nộp lại
                    </div>
                    <div className="assignment-manage-list__meta-value">
                      {item.allowResubmit ? "Có" : "Không"}
                    </div>
                  </div>
                </div>

                {Array.isArray(item.attachmentUrls) && item.attachmentUrls.length > 0 ? (
                  <div className="assignment-manage-list__attachments">
                    <div className="assignment-manage-list__attachments-title">
                      Tệp đính kèm
                    </div>

                    <AttachmentList
                      items={item.attachmentUrls}
                      fallbackPrefix="Attachment"
                    />
                  </div>
                ) : null}
              </div>

              <div className="assignment-manage-list__actions">
                <button
                  type="button"
                  onClick={() => onEdit?.(item)}
                  className="assignment-manage-list__ghost-btn"
                >
                  Edit
                </button>

                <Link
                  to={`/instructor/courses/${courseId}/assignments/${assignmentId}/results`}
                  className="assignment-manage-list__results-link"
                >
                  Results
                </Link>

                <button
                  type="button"
                  onClick={() => onDelete?.(assignmentId)}
                  disabled={deletingId === assignmentId}
                  className="assignment-manage-list__danger-btn"
                >
                  {deletingId === assignmentId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}