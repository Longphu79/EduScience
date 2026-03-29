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
      return item.estimatedRevenue || 0;
    case "completionRate":
      return `${item.completionRate || 0}%`;
    case "quizScore":
      return item.averageQuizScore || 0;
    case "students":
    default:
      return item.totalStudents || 0;
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
        <div className="flex flex-wrap items-center gap-3">
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
        <div className="admin-dashboard-chart-empty">Loading leaderboard...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {topThree.length ? (
              topThree.map((item, index) => (
                <div
                  key={item.instructorId || index}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rank #{item.rank || index + 1}
                  </div>
                  <div className="mt-2 text-xl font-bold text-slate-900">
                    {getAdminUserDisplayName(item)}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {item.email || "No email"}
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-700">
                    <div>
                      <strong>{getSortLabel(sortBy)}:</strong>{" "}
                      {getPrimaryMetric(item, sortBy)}
                    </div>
                    <div>
                      <strong>Students:</strong>{" "}
                      {formatAdminNumber(item.totalStudents || 0)}
                    </div>
                    <div>
                      <strong>Revenue:</strong>{" "}
                      {formatAdminNumber(item.estimatedRevenue || 0)}
                    </div>
                    <div>
                      <strong>Rating:</strong> {item.averageRating || 0}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-dashboard-chart-empty col-span-full">
                No instructor leaderboard data yet.
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rank
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Instructor
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Students
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Enrollments
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Revenue
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rating
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Completion
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quiz Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((item) => (
                    <tr key={item.instructorId}>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        #{item.rank || 0}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {getAdminUserDisplayName(item)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.email || "No email"}
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        {formatAdminNumber(item.totalStudents || 0)}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        {formatAdminNumber(item.totalEnrollments || 0)}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        {formatAdminNumber(item.estimatedRevenue || 0)}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        {item.averageRating || 0}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        {item.completionRate || 0}%
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        {item.averageQuizScore || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
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