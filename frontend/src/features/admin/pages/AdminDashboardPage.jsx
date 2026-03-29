import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import useAdminDashboardPage from "../hooks/useAdminDashboardPage";
import { formatAdminNumber } from "../utils/admin.helpers";
import {
  exportAdminDashboardCsv,
  exportAdminDashboardPdf,
  exportAdminInstructorLeaderboardCsv,
} from "../services/admin.service";
import AdminPageHero from "../components/AdminPageHero";
import AdminStatCard from "../components/AdminStatCard";
import AdminAttentionPanel from "../components/AdminAttentionPanel";
import AdminSectionCard from "../components/AdminSectionCard";
import AdminDashboardQuickActionCard from "../components/AdminDashboardQuickActionCard";
import AdminDashboardSignalsSection from "../components/AdminDashboardSignalsSection";
import AdminDashboardRecentUsersSection from "../components/AdminDashboardRecentUsersSection";
import AdminDashboardRecentCoursesSection from "../components/AdminDashboardRecentCoursesSection";
import AdminDashboardTopCoursesSection from "../components/AdminDashboardTopCoursesSection";
import AdminDashboardLoadingState from "../components/AdminDashboardLoadingState";
import AdminDashboardChartsSection from "../components/AdminDashboardChartsSection";
import AdminInstructorLeaderboardSection from "../components/AdminInstructorLeaderboardSection";
import "../styles/admin-dashboard-page.css";

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export default function AdminDashboardPage() {
  const {
    loading,
    leaderboardLoading,
    stats,
    analytics,
    recentUsers,
    recentCourses,
    topCourses,
    leaderboardItems,
    leaderboardTopThree,
    inactiveUsers,
    toast,
    setToast,
    fetchDashboard,
    fetchLeaderboard,
    filters,
    setFilters,
    applyPreset,
    resetFilters,
    leaderboardSortBy,
    setLeaderboardSortBy,
  } = useAdminDashboardPage();

  async function handleExportCsv() {
    try {
      const blob = await exportAdminDashboardCsv(filters);
      downloadBlob(blob, "admin-dashboard-report.csv");
      setToast({
        message: "Admin dashboard CSV exported successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to export admin dashboard CSV",
        kind: "error",
      });
    }
  }

  async function handleExportPdf() {
    try {
      const blob = await exportAdminDashboardPdf(filters);
      downloadBlob(blob, "admin-dashboard-report.pdf");
      setToast({
        message: "Admin dashboard PDF exported successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to export admin dashboard PDF",
        kind: "error",
      });
    }
  }

  async function handleExportLeaderboardCsv() {
    try {
      const blob = await exportAdminInstructorLeaderboardCsv({
        ...filters,
        sortBy: leaderboardSortBy,
        limit: 50,
      });
      downloadBlob(blob, "admin-instructor-leaderboard.csv");
      setToast({
        message: "Instructor leaderboard CSV exported successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to export instructor leaderboard CSV",
        kind: "error",
      });
    }
  }

  function handleApplyFilters() {
    fetchDashboard(filters);
    fetchLeaderboard({
      filters,
      sortBy: leaderboardSortBy,
    });
  }

  function handleChangeLeaderboardSort(value) {
    setLeaderboardSortBy(value);
    fetchLeaderboard({
      filters,
      sortBy: value,
    });
  }

  return (
    <div className="admin-dashboard-page">
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <AdminPageHero
        title="System Dashboard"
        description="Monitor users, courses, enrollments and overall platform health."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                fetchDashboard(filters);
                fetchLeaderboard({
                  filters,
                  sortBy: leaderboardSortBy,
                });
              }}
              className="admin-dashboard-action-btn"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="admin-dashboard-action-btn"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="admin-dashboard-action-btn"
            >
              Export PDF
            </button>

            <Link to="/admin/users">
              <Button type="button">Manage Users</Button>
            </Link>

            <Link to="/admin/courses">
              <Button type="button">Manage Courses</Button>
            </Link>
          </>
        }
      />

      <AdminSectionCard
        title="Date Range Filter"
        subtitle="Filter dashboard and leaderboard data by date range"
      >
        <div className="admin-dashboard-filter-bar">
          <div className="admin-dashboard-filter-field">
            <label className="admin-dashboard-filter-label">From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              className="admin-dashboard-filter-input"
            />
          </div>

          <div className="admin-dashboard-filter-field">
            <label className="admin-dashboard-filter-label">To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              className="admin-dashboard-filter-input"
            />
          </div>

          <div className="admin-dashboard-filter-actions">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="admin-dashboard-action-btn"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="admin-dashboard-action-btn"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="admin-dashboard-preset-row">
          <button
            type="button"
            onClick={() => applyPreset("7d")}
            className="admin-dashboard-preset-btn"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => applyPreset("30d")}
            className="admin-dashboard-preset-btn"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => applyPreset("month")}
            className="admin-dashboard-preset-btn"
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => applyPreset("year")}
            className="admin-dashboard-preset-btn"
          >
            This year
          </button>
        </div>
      </AdminSectionCard>

      <div className="admin-dashboard-quick-grid">
        <AdminDashboardQuickActionCard
          title="User Management"
          description="Review accounts, deactivate inactive users and inspect profiles."
          to="/admin/users"
          tone="indigo"
        />
        <AdminDashboardQuickActionCard
          title="Course Management"
          description="Review course quality, publishing state and instructor ownership."
          to="/admin/courses"
          tone="emerald"
        />
        <AdminDashboardQuickActionCard
          title="Published Courses"
          description={`${formatAdminNumber(
            stats.totalPublishedCourses
          )} currently published on the platform.`}
          to="/admin/courses?status=published"
          tone="amber"
        />
        <AdminDashboardQuickActionCard
          title="Inactive Users"
          description="Inspect accounts that are currently disabled."
          to="/admin/users?isActive=false"
          tone="slate"
        />
      </div>

      <AdminDashboardSignalsSection
        stats={stats}
        inactiveUsers={inactiveUsers}
      />

      {loading ? (
        <AdminDashboardLoadingState />
      ) : (
        <>
          <div className="admin-dashboard-stats-grid">
            <AdminStatCard
              label="Total Users"
              value={formatAdminNumber(stats.totalUsers)}
              subtitle={`${formatAdminNumber(stats.totalActiveUsers)} active users`}
              tone="indigo"
            />
            <AdminStatCard
              label="Students"
              value={formatAdminNumber(stats.totalStudents)}
              subtitle={`${formatAdminNumber(stats.totalInstructors)} instructors`}
              tone="emerald"
            />
            <AdminStatCard
              label="Total Courses"
              value={formatAdminNumber(stats.totalCourses)}
              subtitle={`${formatAdminNumber(stats.totalPublishedCourses)} published`}
              tone="amber"
            />
            <AdminStatCard
              label="Enrollments"
              value={formatAdminNumber(stats.totalEnrollments)}
              subtitle={`${formatAdminNumber(stats.completedEnrollments)} completed`}
              tone="rose"
            />
            <AdminStatCard
              label="Estimated Revenue"
              value={formatAdminNumber(stats.estimatedRevenue)}
              subtitle="Based on enrollments × effective course price"
              tone="slate"
            />
            <AdminStatCard
              label="Completion Rate"
              value={`${formatAdminNumber(stats.completionRate)}%`}
              subtitle={`${formatAdminNumber(
                stats.averageProgress
              )}% average learner progress`}
              tone="indigo"
            />
            <AdminStatCard
              label="Certificates"
              value={formatAdminNumber(stats.totalCertificates)}
              subtitle={`${formatAdminNumber(stats.totalReviews)} reviews in total`}
              tone="emerald"
            />
            <AdminStatCard
              label="Admins"
              value={formatAdminNumber(stats.totalAdmins)}
              subtitle={`${formatAdminNumber(stats.totalDraftCourses)} draft courses`}
              tone="amber"
            />
          </div>

          <AdminDashboardChartsSection stats={stats} analytics={analytics} />

          <AdminInstructorLeaderboardSection
            items={leaderboardItems}
            topThree={leaderboardTopThree}
            sortBy={leaderboardSortBy}
            onSortChange={handleChangeLeaderboardSort}
            onExportCsv={handleExportLeaderboardCsv}
            loading={leaderboardLoading}
          />

          <AdminSectionCard
            title="Needs Attention"
            subtitle="Operational items worth reviewing next."
          >
            <AdminAttentionPanel stats={stats} />
          </AdminSectionCard>

          <div className="grid gap-6 xl:grid-cols-3">
            <AdminDashboardRecentUsersSection users={recentUsers} />
            <AdminDashboardRecentCoursesSection courses={recentCourses} />
            <AdminDashboardTopCoursesSection courses={topCourses} />
          </div>
        </>
      )}
    </div>
  );
}