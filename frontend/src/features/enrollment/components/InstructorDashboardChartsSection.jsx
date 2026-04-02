import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import EnrollmentSectionCard from "./EnrollmentSectionCard";

const PIE_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#f43f5e"];

function formatShortLabel(value = "", max = 16) {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="instructor-dashboard-page__chart-tooltip">
      {label ? (
        <div className="instructor-dashboard-page__chart-tooltip-label">
          {label}
        </div>
      ) : null}

      {payload.map((item) => (
        <div
          key={`${item.name}-${item.dataKey}`}
          className="instructor-dashboard-page__chart-tooltip-row"
        >
          <span>{item.name}: </span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function InstructorDashboardChartsSection({
  summary,
  pageClassName = "",
}) {
  const topCourseData = useMemo(() => {
    const courses = Array.isArray(summary?.topCourses) ? summary.topCourses : [];
    return courses.slice(0, 5).map((item) => ({
      name: formatShortLabel(item?.title || "Course"),
      enrollments: Number(item?.totalEnrollments || 0),
      revenue: Number(item?.estimatedRevenue || 0),
    }));
  }, [summary]);

  const trendData = useMemo(() => {
    const trend = Array.isArray(summary?.monthlyTrend) ? summary.monthlyTrend : [];
    return trend.map((item) => ({
      month: item?.label || item?.key || "Month",
      enrollments: Number(item?.enrollments || 0),
      quizAttempts: Number(item?.quizAttempts || 0),
      submissions: Number(item?.submissions || 0),
    }));
  }, [summary]);

  const qualityData = useMemo(() => {
    const completionRate = Number(summary?.completionRate || 0);
    const quizPassRate = Number(summary?.quizPassRate || 0);
    const pending = Math.min(
      100,
      Number(summary?.pendingAssignmentGradingCount || 0),
    );

    return [
      { name: "Completion", value: completionRate },
      { name: "Quiz Pass", value: quizPassRate },
      { name: "Pending", value: pending },
    ].filter((item) => item.value > 0);
  }, [summary]);

  return (
    <div className={`${pageClassName}__chart-grid`}>
      <EnrollmentSectionCard
        title="Top Courses"
        description="Most effective courses by enrollments."
        pageClassName={pageClassName}
      >
        {!topCourseData.length ? (
          <div className={`${pageClassName}__chart-empty`}>
            No chart data yet.
          </div>
        ) : (
          <div className={`${pageClassName}__chart-box`}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topCourseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar
                  dataKey="enrollments"
                  name="Enrollments"
                  fill="#4f46e5"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </EnrollmentSectionCard>

      <EnrollmentSectionCard
        title="Quality Snapshot"
        description="Completion, pass rate, and pending grading indicators."
        pageClassName={pageClassName}
      >
        {!qualityData.length ? (
          <div className={`${pageClassName}__chart-empty`}>
            No quality metrics yet.
          </div>
        ) : (
          <div className={`${pageClassName}__chart-box`}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={qualityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={108}
                  paddingAngle={4}
                >
                  {qualityData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </EnrollmentSectionCard>

      <EnrollmentSectionCard
        title="Monthly Teaching Trend"
        description="Enrollments, quiz attempts and submissions over time."
        pageClassName={pageClassName}
      >
        {!trendData.length ? (
          <div className={`${pageClassName}__chart-empty`}>
            No monthly trend yet.
          </div>
        ) : (
          <div className={`${pageClassName}__chart-box ${pageClassName}__chart-box--wide`}>
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  name="Enrollments"
                  stroke="#4f46e5"
                  fill="#c7d2fe"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="quizAttempts"
                  name="Quiz Attempts"
                  stroke="#10b981"
                  fill="#bbf7d0"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  name="Submissions"
                  stroke="#f59e0b"
                  fill="#fde68a"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </EnrollmentSectionCard>
    </div>
  );
}