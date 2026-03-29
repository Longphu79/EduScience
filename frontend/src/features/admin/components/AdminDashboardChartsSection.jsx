import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import AdminSectionCard from "./AdminSectionCard";
import { formatAdminNumber } from "../utils/admin.helpers";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#334155"];

function ChartEmpty() {
  return <div className="admin-dashboard-chart-empty">No chart data yet.</div>;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="admin-dashboard-chart-tooltip">
      {label ? <div className="admin-dashboard-chart-tooltip__label">{label}</div> : null}
      {payload.map((item) => (
        <div key={item.dataKey} className="admin-dashboard-chart-tooltip__row">
          <span>{item.name}: </span>
          <strong>{formatAdminNumber(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardChartsSection({
  stats = {},
  analytics = {},
}) {
  const roleData = useMemo(
    () => [
      { name: "Students", value: Number(stats.totalStudents || 0) },
      { name: "Instructors", value: Number(stats.totalInstructors || 0) },
      { name: "Admins", value: Number(stats.totalAdmins || 0) },
    ].filter((item) => item.value > 0),
    [stats]
  );

  const courseStatusData = useMemo(
    () => [
      { name: "Draft", value: Number(stats.totalDraftCourses || 0) },
      { name: "Published", value: Number(stats.totalPublishedCourses || 0) },
      { name: "Archived", value: Number(stats.totalArchivedCourses || 0) },
    ].filter((item) => item.value > 0),
    [stats]
  );

  const categoryData = useMemo(
    () =>
      Array.isArray(analytics.topCategories)
        ? analytics.topCategories.map((item) => ({
            name: item.category || "General",
            enrollments: Number(item.totalEnrollments || 0),
            revenue: Number(item.estimatedRevenue || 0),
          }))
        : [],
    [analytics]
  );

  const instructorData = useMemo(
    () =>
      Array.isArray(analytics.topInstructors)
        ? analytics.topInstructors.map((item) => ({
            name: item.fullName || "Instructor",
            enrollments: Number(item.totalEnrollments || 0),
            revenue: Number(item.estimatedRevenue || 0),
          }))
        : [],
    [analytics]
  );

  const trendData = useMemo(
    () =>
      Array.isArray(analytics.monthlyTrend)
        ? analytics.monthlyTrend.map((item) => ({
            month: item.label || item.key,
            users: Number(item.users || 0),
            enrollments: Number(item.enrollments || 0),
            revenue: Number(item.revenue || 0),
          }))
        : [],
    [analytics]
  );

  return (
    <div className="admin-dashboard-chart-grid">
      <AdminSectionCard
        title="User Roles"
        subtitle="Distribution of accounts by role"
      >
        {!roleData.length ? (
          <ChartEmpty />
        ) : (
          <div className="admin-dashboard-chart-box">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {roleData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Course Status"
        subtitle="Draft, published, archived"
      >
        {!courseStatusData.length ? (
          <ChartEmpty />
        ) : (
          <div className="admin-dashboard-chart-box">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={courseStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {courseStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Top Categories"
        subtitle="By enrollments"
      >
        {!categoryData.length ? (
          <ChartEmpty />
        ) : (
          <div className="admin-dashboard-chart-box">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="enrollments" name="Enrollments" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Top Instructors"
        subtitle="By enrollments"
      >
        {!instructorData.length ? (
          <ChartEmpty />
        ) : (
          <div className="admin-dashboard-chart-box">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={instructorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="enrollments" name="Enrollments" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="6-Month Platform Trend"
        subtitle="Users, enrollments, revenue"
      >
        {!trendData.length ? (
          <ChartEmpty />
        ) : (
          <div className="admin-dashboard-chart-box">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="users" name="Users" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="enrollments" name="Enrollments" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
}