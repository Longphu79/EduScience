import AdminSectionCard from "./AdminSectionCard";
import AdminInsightPill from "./AdminInsightPill";
import { formatAdminNumber } from "../utils/admin.helpers";

export default function AdminDashboardSignalsSection({
  stats = {},
  inactiveUsers = 0,
}) {
  const activeRatio = stats.totalUsers
    ? Math.round(
        (Number(stats.totalActiveUsers || 0) / Number(stats.totalUsers || 1)) *
          100
      )
    : 0;

  const completionHealth = stats.totalEnrollments
    ? Math.round(
        (Number(stats.completedEnrollments || 0) /
          Number(stats.totalEnrollments || 1)) *
          100
      )
    : 0;

  return (
    <AdminSectionCard
      title="Platform Signals"
      subtitle="High-level indicators and shortcuts for quick review."
    >
      <div className="admin-dashboard-pill-grid">
        <AdminInsightPill
          label="Active User Ratio"
          value={`${activeRatio}%`}
          hint={`${formatAdminNumber(
            stats.totalActiveUsers
          )} active of ${formatAdminNumber(stats.totalUsers)}`}
          to="/admin/users"
          tone="emerald"
        />

        <AdminInsightPill
          label="Draft Course Load"
          value={formatAdminNumber(stats.totalDraftCourses)}
          hint="Courses still waiting for publish readiness"
          to="/admin/courses?status=draft"
          tone="amber"
        />

        <AdminInsightPill
          label="Inactive Users"
          value={formatAdminNumber(inactiveUsers)}
          hint="Accounts currently not active"
          to="/admin/users?isActive=false"
          tone="red"
        />

        <AdminInsightPill
          label="Completion Health"
          value={`${completionHealth}%`}
          hint={`${formatAdminNumber(
            stats.completedEnrollments
          )} completed enrollments`}
          to="/admin/dashboard"
          tone="indigo"
        />
      </div>
    </AdminSectionCard>
  );
}