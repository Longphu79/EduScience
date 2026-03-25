import { Link } from "react-router-dom";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import {
    formatDateTimeVN,
    getAssignmentId,
    getLatestSubmissionInfo,
    getSubmissionStatusMeta,
} from "../utils/assignment.helpers";
import "../styles/assignment-components.css";

export default function AssignmentList({
    items = [],
    submissionsMap = {},
    courseId = "",
    loading = false,
}) {
    if (loading) {
        return (
            <div className="assignment-list__skeleton-wrap">
                {[1, 2].map((item) => (
                    <div key={item} className="assignment-list__skeleton-card">
                        <div className="assignment-list__skeleton-title" />
                        <div className="assignment-list__skeleton-line" />
                        <div className="assignment-list__skeleton-line assignment-list__skeleton-line--short" />
                        <div className="assignment-list__skeleton-button" />
                    </div>
                ))}
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="assignment-list__empty-card">
                <div className="assignment-list__empty-title">
                    Chưa có bài tập nào
                </div>
                <div className="assignment-list__empty-text">
                    Instructor chưa đăng bài tập cho khóa học này.
                </div>
            </div>
        );
    }

    return (
        <div className="assignment-list">
            {items.map((item, index) => {
                const assignmentId = getAssignmentId(item);
                const submission = submissionsMap[assignmentId];
                const statusMeta = submission
                    ? getSubmissionStatusMeta(
                          submission.status,
                          item.allowResubmit,
                      )
                    : getSubmissionStatusMeta(null, item.allowResubmit);

                return (
                    <div key={assignmentId} className="assignment-list__card">
                        <div className="assignment-list__card-layout">
                            <div className="assignment-list__content">
                                <div className="assignment-list__header">
                                    <div className="assignment-list__header-main">
                                        <div className="assignment-list__index">
                                            {index + 1}
                                        </div>

                                        <div className="assignment-list__title-group">
                                            <h3 className="assignment-list__title">
                                                {item.title ||
                                                    "Untitled Assignment"}
                                            </h3>

                                            <p className="assignment-list__description">
                                                {item.description ||
                                                    "Chưa có mô tả bài tập."}
                                            </p>
                                        </div>
                                    </div>

                                    <AssignmentStatusBadge
                                        label={statusMeta.label}
                                        variant={statusMeta.variant}
                                        small
                                    />
                                </div>

                                <div className="assignment-list__meta-grid">
                                    <div className="assignment-list__meta-card">
                                        <div className="assignment-list__meta-label">
                                            Hạn nộp
                                        </div>
                                        <div className="assignment-list__meta-value">
                                            {formatDateTimeVN(item.dueDate)}
                                        </div>
                                    </div>

                                    <div className="assignment-list__meta-card">
                                        <div className="assignment-list__meta-label">
                                            Điểm tối đa
                                        </div>
                                        <div className="assignment-list__meta-value">
                                            {item.maxScore ?? 100}
                                        </div>
                                    </div>

                                    <div className="assignment-list__meta-card">
                                        <div className="assignment-list__meta-label">
                                            Nộp lại
                                        </div>
                                        <div className="assignment-list__meta-value">
                                            {item.allowResubmit
                                                ? "Cho phép"
                                                : "Không"}
                                        </div>
                                    </div>

                                    <div className="assignment-list__meta-card">
                                        <div className="assignment-list__meta-label">
                                            Điểm hiện tại
                                        </div>
                                        <div className="assignment-list__meta-value">
                                            {submission?.grade != null
                                                ? `${submission.grade}/${item.maxScore ?? 100}`
                                                : "Chưa chấm"}
                                        </div>
                                    </div>
                                </div>

                                <div className="assignment-list__helper-box">
                                    <div className="assignment-list__helper-title">
                                        {statusMeta.helperText}
                                    </div>

                                    {submission ? (
                                        <div className="assignment-list__helper-grid">
                                            <div className="assignment-list__helper-item">
                                                <span className="assignment-list__helper-label">
                                                    Lần nộp gần nhất:
                                                </span>
                                                <span className="assignment-list__helper-value">
                                                    {getLatestSubmissionInfo(
                                                        submission,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="assignment-list__helper-item">
                                                <span className="assignment-list__helper-label">
                                                    Feedback:
                                                </span>
                                                <span className="assignment-list__helper-value">
                                                    {submission.feedback ||
                                                        "Chưa có nhận xét"}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="assignment-list__helper-grid">
                                            <div className="assignment-list__helper-item">
                                                <span className="assignment-list__helper-label">
                                                    Trạng thái:
                                                </span>
                                                <span className="assignment-list__helper-value">
                                                    Chưa có bài nộp
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="assignment-list__actions">
                                <Link
                                    to={`/learn/${courseId}/assignments/${assignmentId}`}
                                    className="assignment-list__primary-link"
                                >
                                    {statusMeta.actionText}
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
