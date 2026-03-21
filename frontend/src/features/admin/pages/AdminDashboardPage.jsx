import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import useAdminDashboardPage from "../hooks/useAdminDashboardPage";
import { formatAdminNumber } from "../utils/admin.helpers";
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
import "../styles/admin-dashboard-page.css";

export default function AdminDashboardPage() {
  const {
    loading,
    stats,
    recentUsers,
    recentCourses,
    topCourses,
    inactiveUsers,
    toast,
    setToast,
    fetchDashboard,
  } = useAdminDashboardPage();

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
              onClick={fetchDashboard}
              className="admin-dashboard-action-btn"
            >
              Refresh
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
              label="Admins"
              value={formatAdminNumber(stats.totalAdmins)}
              subtitle={`${formatAdminNumber(stats.totalDraftCourses)} draft courses`}
              tone="slate"
            />
          </div>

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