import React from "react";
import { Link } from "react-router-dom";
import {
  formatDateTime,
  getStatusMeta,
  normalizeStudentProgressItem,
} from "../utils/enrollment.helpers";

export default function StudentProgressTable({
  students = [],
  courseId,
  compact = false,
  pageClassName = "",
}) {
  const rows = students.map(normalizeStudentProgressItem);

  if (!rows.length) {
    return <p className={`${pageClassName}__empty-soft`}>Chưa có học viên.</p>;
  }

  if (compact) {
    return (
      <div className={`${pageClassName}__mobile-list`}>
        {rows.map((item) => {
          const statusMeta = getStatusMeta(item.__progress, item.__completed);

          return (
            <div
              key={item.__rowId}
              className={`${pageClassName}__mobile-card`}
            >
              <div className={`${pageClassName}__mobile-row`}>
                <div
                  className={`${pageClassName}__avatar ${pageClassName}__avatar--lg`}
                >
                  {(item.__studentName || "S").slice(0, 1)}
                </div>

                <div className={`${pageClassName}__mobile-main`}>
                  <div className={`${pageClassName}__mobile-top`}>
                    <div>
                      <div className={`${pageClassName}__mobile-name`}>
                        {item.__studentName}
                      </div>
                      <div className={`${pageClassName}__mobile-email`}>
                        {item.__email || "N/A"}
                      </div>
                    </div>

                    <span
                      className={`${pageClassName}__status ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <div
                    className={`${pageClassName}__progress-wrap ${pageClassName}__progress-wrap--mobile`}
                  >
                    <div className={`${pageClassName}__progress-bar`}>
                      <div
                        className={`${pageClassName}__progress-fill`}
                        style={{ width: `${item.__progress}%` }}
                      />
                    </div>
                    <span className={`${pageClassName}__progress-badge`}>
                      {item.__progress}%
                    </span>
                  </div>

                  <div className={`${pageClassName}__mobile-date`}>
                    Enrolled: {formatDateTime(item.__enrolledAt)}
                  </div>

                  <div className={`${pageClassName}__actions`}>
                    {item.__studentId ? (
                      <>
                        <Link
                          to={`/instructor/courses/${courseId}/students/${item.__studentId}`}
                          className={`${pageClassName}__link-btn ${pageClassName}__link-btn--indigo`}
                        >
                          View Detail
                        </Link>

                        <Link
                          to={`/instructor/courses/${courseId}/chat?studentId=${item.__studentId}`}
                          className={`${pageClassName}__link-btn ${pageClassName}__link-btn--violet`}
                        >
                          Chat
                        </Link>
                      </>
                    ) : (
                      <span className={`${pageClassName}__missing`}>
                        Missing student id
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${pageClassName}__table-wrap`}>
      <div className={`${pageClassName}__table-scroll`}>
        <table className={`${pageClassName}__table`}>
          <thead className={`${pageClassName}__thead`}>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Enrolled At</th>
              <th className={`${pageClassName}__center`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => {
              const statusMeta = getStatusMeta(item.__progress, item.__completed);

              return (
                <tr key={item.__rowId} className={`${pageClassName}__row`}>
                  <td>
                    <div className={`${pageClassName}__student`}>
                      <div className={`${pageClassName}__avatar`}>
                        {(item.__studentName || "S").slice(0, 1)}
                      </div>
                      <div>
                        <div className={`${pageClassName}__student-name`}>
                          {item.__studentName}
                        </div>
                        <div className={`${pageClassName}__student-id`}>
                          ID: {item.__studentId || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className={`${pageClassName}__muted`}>
                    {item.__email || "N/A"}
                  </td>

                  <td>
                    <div className={`${pageClassName}__progress-wrap`}>
                      <div className={`${pageClassName}__progress-bar`}>
                        <div
                          className={`${pageClassName}__progress-fill`}
                          style={{ width: `${item.__progress}%` }}
                        />
                      </div>
                      <span className={`${pageClassName}__progress-badge`}>
                        {item.__progress}%
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`${pageClassName}__status ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </td>

                  <td className={`${pageClassName}__muted`}>
                    {formatDateTime(item.__enrolledAt)}
                  </td>

                  <td className={`${pageClassName}__center`}>
                    {item.__studentId ? (
                      <div className={`${pageClassName}__actions`}>
                        <Link
                          to={`/instructor/courses/${courseId}/students/${item.__studentId}`}
                          className={`${pageClassName}__link-btn ${pageClassName}__link-btn--indigo`}
                        >
                          View Detail
                        </Link>

                        <Link
                          to={`/instructor/courses/${courseId}/chat?studentId=${item.__studentId}`}
                          className={`${pageClassName}__link-btn ${pageClassName}__link-btn--violet`}
                        >
                          Chat
                        </Link>
                      </div>
                    ) : (
                      <span className={`${pageClassName}__missing`}>
                        Missing student id
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}