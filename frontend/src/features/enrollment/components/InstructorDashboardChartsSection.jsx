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
import EnrollmentSectionCard from "./EnrollmentSectionCard";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#334155"];

function ChartEmpty({ pageClassName = "" }) {
    return (
        <div className={`${pageClassName}__empty-soft`}>No chart data yet.</div>
    );
}

function TooltipBox({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="instructor-dashboard-chart-tooltip">
            {label ? (
                <div className="instructor-dashboard-chart-tooltip__label">
                    {label}
                </div>
            ) : null}
            {payload.map((item) => (
                <div
                    key={item.dataKey}
                    className="instructor-dashboard-chart-tooltip__row"
                >
                    <span>{item.name}: </span>
                    <strong>{item.value}</strong>
                </div>
            ))}
        </div>
    );
}

export default function InstructorDashboardChartsSection({
    summary = {},
    pageClassName = "",
}) {
    const completionData = useMemo(
        () =>
            [
                {
                    name: "Completed",
                    value: Number(summary.completedEnrollments || 0),
                },
                {
                    name: "In Progress",
                    value: Math.max(
                        0,
                        Number(summary.totalEnrollments || 0) -
                            Number(summary.completedEnrollments || 0),
                    ),
                },
            ].filter((item) => item.value > 0),
        [summary],
    );

    const assignmentData = useMemo(
        () =>
            [
                {
                    name: "Pending",
                    value: Number(summary.pendingAssignmentGradingCount || 0),
                },
                {
                    name: "Graded",
                    value: Math.max(
                        0,
                        Number(summary.totalSubmissions || 0) -
                            Number(summary.pendingAssignmentGradingCount || 0),
                    ),
                },
            ].filter((item) => item.value > 0),
        [summary],
    );

    const topCoursesData = useMemo(
        () =>
            Array.isArray(summary.topCourses)
                ? summary.topCourses.map((item) => ({
                      name: item.title || "Course",
                      enrollments: Number(item.totalEnrollments || 0),
                      avgQuizScore: Number(item.averageQuizScore || 0),
                  }))
                : [],
        [summary],
    );

    const trendData = useMemo(
        () =>
            Array.isArray(summary.monthlyTrend)
                ? summary.monthlyTrend.map((item) => ({
                      month: item.label || item.key,
                      enrollments: Number(item.enrollments || 0),
                      quizAttempts: Number(item.quizAttempts || 0),
                      submissions: Number(item.submissions || 0),
                  }))
                : [],
        [summary],
    );

    return (
        <div className={`${pageClassName}__chart-grid`}>
            <EnrollmentSectionCard
                title="Completion Overview"
                description="Completed vs in-progress enrollments"
                pageClassName={pageClassName}
            >
                {!completionData.length ? (
                    <ChartEmpty pageClassName={pageClassName} />
                ) : (
                    <div className={`${pageClassName}__chart-box`}>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={completionData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={110}
                                    innerRadius={55}
                                    paddingAngle={3}
                                >
                                    {completionData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                PIE_COLORS[
                                                    index % PIE_COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<TooltipBox />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </EnrollmentSectionCard>

            <EnrollmentSectionCard
                title="Assignment Grading Status"
                description="Pending vs graded submissions"
                pageClassName={pageClassName}
            >
                {!assignmentData.length ? (
                    <ChartEmpty pageClassName={pageClassName} />
                ) : (
                    <div className={`${pageClassName}__chart-box`}>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={assignmentData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={110}
                                    innerRadius={55}
                                    paddingAngle={3}
                                >
                                    {assignmentData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                PIE_COLORS[
                                                    index % PIE_COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<TooltipBox />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </EnrollmentSectionCard>

            <EnrollmentSectionCard
                title="Top Courses by Enrollments"
                description="Strongest course performance"
                pageClassName={pageClassName}
            >
                {!topCoursesData.length ? (
                    <ChartEmpty pageClassName={pageClassName} />
                ) : (
                    <div className={`${pageClassName}__chart-box`}>
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={topCoursesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip content={<TooltipBox />} />
                                <Legend />
                                <Bar
                                    dataKey="enrollments"
                                    name="Enrollments"
                                    fill="#6366f1"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </EnrollmentSectionCard>

            <EnrollmentSectionCard
                title="Top Courses by Quiz Score"
                description="Average quiz score across top courses"
                pageClassName={pageClassName}
            >
                {!topCoursesData.length ? (
                    <ChartEmpty pageClassName={pageClassName} />
                ) : (
                    <div className={`${pageClassName}__chart-box`}>
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={topCoursesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip content={<TooltipBox />} />
                                <Legend />
                                <Bar
                                    dataKey="avgQuizScore"
                                    name="Avg Quiz Score"
                                    fill="#10b981"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </EnrollmentSectionCard>

            <EnrollmentSectionCard
                title="6-Month Teaching Activity"
                description="Enrollments, quiz attempts, submissions"
                pageClassName={pageClassName}
            >
                {!trendData.length ? (
                    <ChartEmpty pageClassName={pageClassName} />
                ) : (
                    <div className={`${pageClassName}__chart-box`}>
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip content={<TooltipBox />} />
                                <Legend />
                                <Bar
                                    dataKey="enrollments"
                                    name="Enrollments"
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
        </div>
    );
}
