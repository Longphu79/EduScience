import React from "react";
import AdminSectionCard from "./AdminSectionCard";
import {
  formatAdminNumber,
  getAdminUserDisplayName,
} from "../utils/admin.helpers";

function getSortLabel(sortBy = "students") {
  switch (sortBy) {
    case "rating":
      return "Rating";
    case "revenue":
      return "Revenue";
    case "completionRate":
      return "Completion Rate";
    case "quizScore":
      return "Quiz Score";
    case "students":
    default:
      return "Students";
  }
}

function getPrimaryMetric(item = {}, sortBy = "students") {
  switch (sortBy) {
    case "rating":
      return item.averageRating || 0;
    case "revenue":
      return formatAdminNumber(item.estimatedRevenue || 0);
    case "completionRate":
      return `${item.completionRate || 0}%`;
    case "quizScore":
      return item.averageQuizScore || 0;
    case "students":
    default:
      return formatAdminNumber(item.totalStudents || 0);
  }
}

export default function AdminInstructorLeaderboardSection({
  items = [],
  topThree = [],
  sortBy = "students",
  onSortChange,
  onExportCsv,
  loading = false,
}) {
  const sortOptions = [
    { value: "students", label: "Students" },
    { value: "rating", label: "Rating" },
    { value: "revenue", label: "Revenue" },
    { value: "completionRate", label: "Completion Rate" },
    { value: "quizScore", label: "Quiz Score" },
  ];

  return (
    <AdminSectionCard
      title="Instructor Leaderboard"
      subtitle={`Top instructors ranked by ${getSortLabel(sortBy).toLowerCase()}`}
      action={
        <div className="admin-dashboard-leaderboard-action">
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="admin-dashboard-filter-input"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onExportCsv}
            className="admin-dashboard-action-btn"
          >
            Export CSV
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="admin-dashboard-chart-empty">
          Loading leaderboard...
        </div>
      ) : (
        <>
          <div className="admin-dashboard-leaderboard-top-grid">
            {topThree.length ? (
              topThree.map((item, index) => (
                <div
                  key={item.instructorId || index}
                  className="admin-dashboard-leaderboard-top-card"
                >
                  <div className="admin-dashboard-leaderboard-top-rank">
                    Rank #{item.rank || index + 1}
                  </div>

                  <div className="admin-dashboard-leaderboard-top-name">
                    {getAdminUserDisplayName(item)}
                  </div>

                  <div className="admin-dashboard-leaderboard-top-email">
                    {item.email || "No email"}
                  </div>

                  <div className="admin-dashboard-leaderboard-metrics">
                    <div className="admin-dashboard-leaderboard-metric">
                      <span>{getSortLabel(sortBy)}</span>
                      <strong>{getPrimaryMetric(item, sortBy)}</strong>
                    </div>

                    <div className="admin-dashboard-leaderboard-metric">
                      <span>Students</span>
                      <strong>
                        {formatAdminNumber(item.totalStudents || 0)}
                      </strong>
                    </div>

                    <div className="admin-dashboard-leaderboard-metric">
                      <span>Revenue</span>
                      <strong>
                        {formatAdminNumber(item.estimatedRevenue || 0)}
                      </strong>
                    </div>

                    <div className="admin-dashboard-leaderboard-metric">
                      <span>Rating</span>
                      <strong>{item.averageRating || 0}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-dashboard-chart-empty">
                No instructor leaderboard data yet.
              </div>
            )}
          </div>

          <div className="admin-dashboard-table-wrap">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Instructor</th>
                  <th>Students</th>
                  <th>Enrollments</th>
                  <th>Revenue</th>
                  <th>Rating</th>
                  <th>Completion</th>
                  <th>Quiz Score</th>
                </tr>
              </thead>

              <tbody>
                {items.length ? (
                  items.map((item) => (
                    <tr key={item.instructorId}>
                      <td>#{item.rank || 0}</td>

                      <td>
                        <div className="admin-dashboard-table__name">
                          {getAdminUserDisplayName(item)}
                        </div>
                        <div className="admin-dashboard-table__sub">
                          {item.email || "No email"}
                        </div>
                      </td>

                      <td>{formatAdminNumber(item.totalStudents || 0)}</td>
                      <td>{formatAdminNumber(item.totalEnrollments || 0)}</td>
                      <td>{formatAdminNumber(item.estimatedRevenue || 0)}</td>
                      <td>{item.averageRating || 0}</td>
                      <td>{item.completionRate || 0}%</td>
                      <td>{item.averageQuizScore || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="admin-dashboard-table__sub">
                      No instructor leaderboard data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminSectionCard>
  );
}