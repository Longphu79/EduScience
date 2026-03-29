import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import EnrollmentSectionCard from "./EnrollmentSectionCard";

function ChartEmpty({ pageClassName = "" }) {
  return (
    <div className={`${pageClassName}__empty-soft`}>
      No analytics chart data available yet.
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} style={{ fontSize: 14 }}>
          <span>{item.name}: </span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function StudentLearningTrendSection({
  weeklyTrend = [],
  monthlyTrend = [],
  pageClassName = "",
}) {
  const safeWeeklyTrend = useMemo(
    () => (Array.isArray(weeklyTrend) ? weeklyTrend : []),
    [weeklyTrend]
  );

  const safeMonthlyTrend = useMemo(
    () => (Array.isArray(monthlyTrend) ? monthlyTrend : []),
    [monthlyTrend]
  );

  return (
    <div className={`${pageClassName}__chart-grid`}>
      <EnrollmentSectionCard
        title="Weekly Learning Trend"
        description="Your recent study activity over the last 7 days."
        pageClassName={pageClassName}
      >
        {!safeWeeklyTrend.length ? (
          <ChartEmpty pageClassName={pageClassName} />
        ) : (
          <div className={`${pageClassName}__chart-box`}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={safeWeeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<TrendTooltip />} />
                <Legend />
                <Bar
                  dataKey="activities"
                  name="Activities"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="quizAttempts"
                  name="Quiz Attempts"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="submissions"
                  name="Submissions"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </EnrollmentSectionCard>

      <EnrollmentSectionCard
        title="6-Month Learning Trend"
        description="Monthly learning actions and progress momentum."
        pageClassName={pageClassName}
      >
        {!safeMonthlyTrend.length ? (
          <ChartEmpty pageClassName={pageClassName} />
        ) : (
          <div className={`${pageClassName}__chart-box`}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={safeMonthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<TrendTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  name="Enrollments"
                  stroke="#6366f1"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="quizAttempts"
                  name="Quiz Attempts"
                  stroke="#10b981"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  name="Submissions"
                  stroke="#f59e0b"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </EnrollmentSectionCard>
    </div>
  );
}