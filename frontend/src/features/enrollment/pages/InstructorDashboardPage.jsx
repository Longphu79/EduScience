import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import CourseWideCard from "../components/CourseWideCard";
import EnrollmentSectionCard from "../components/EnrollmentSectionCard";
import EnrollmentStatCard from "../components/EnrollmentStatCard";
import InstructorDashboardChartsSection from "../components/InstructorDashboardChartsSection";
import useInstructorDashboardPage from "../hooks/useInstructorDashboardPage";
import {
    exportInstructorDashboardCsv,
    exportInstructorDashboardPdf,
} from "../services/enrollment.service";
import { getUserId } from "../utils/enrollment.helpers";
import { useAuth } from "../../auth/state/useAuth";
import "../styles/instructor-dashboard-page.css";

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

function HeroMetric({ label, value, hint, pageClassName }) {
    return (
        <div className={`${pageClassName}__hero-metric`}>
            <div className={`${pageClassName}__hero-metric-label`}>{label}</div>
            <div className={`${pageClassName}__hero-metric-value`}>{value}</div>
            {hint ? (
                <div className={`${pageClassName}__hero-metric-hint`}>
                    {hint}
                </div>
            ) : null}
        </div>
    );
}

export default function InstructorDashboardPage() {
    const pageClassName = "instructor-dashboard-page";
    const { user } = useAuth();
    const instructorId = getUserId(user);

    const {
        booting,
        loading,
        summary,
        latestCourses,
        toast,
        setToast,
        loadSummary,
        filters,
        setFilters,
        applyPreset,
        resetFilters,
    } = useInstructorDashboardPage();

    if (booting || loading) {
        return (
            <div className={pageClassName}>
                <div className={`${pageClassName}__state-card`}>
                    Loading dashboard...
                </div>
            </div>
        );
    }

    const topCourses = Array.isArray(summary?.topCourses)
        ? summary.topCourses
        : [];
    const monthlyTrend = Array.isArray(summary?.monthlyTrend)
        ? summary.monthlyTrend
        : [];

    async function handleExportCsv() {
        try {
            const blob = await exportInstructorDashboardCsv(
                instructorId,
                filters,
            );
            downloadBlob(blob, "instructor-dashboard-report.csv");
            setToast({
                message: "Instructor dashboard CSV exported successfully",
                kind: "success",
            });
        } catch (error) {
            setToast({
                message:
                    error?.message ||
                    "Failed to export instructor dashboard CSV",
                kind: "error",
            });
        }
    }

    async function handleExportPdf() {
        try {
            const blob = await exportInstructorDashboardPdf(
                instructorId,
                filters,
            );
            downloadBlob(blob, "instructor-dashboard-report.pdf");
            setToast({
                message: "Instructor dashboard PDF exported successfully",
                kind: "success",
            });
        } catch (error) {
            setToast({
                message:
                    error?.message ||
                    "Failed to export instructor dashboard PDF",
                kind: "error",
            });
        }
    }

    function handleApplyFilters() {
        loadSummary(filters);
    }

    return (
        <div className={pageClassName}>
            {toast.message ? (
                <Toast
                    kind={toast.kind}
                    message={toast.message}
                    onClose={() => setToast({ message: "", kind: "success" })}
                />
            ) : null}

            {/* HERO DASHBOARD MỚI */}
            <section className={`${pageClassName}__hero-shell`}>
                <div className={`${pageClassName}__hero-panel`}>
                    <div className={`${pageClassName}__hero-top`}>
                        <div className={`${pageClassName}__hero-copy`}>
                            <div className={`${pageClassName}__eyebrow`}>
                                Instructor Dashboard
                            </div>

                            <h1 className={`${pageClassName}__hero-title`}>
                                Manage your courses and track teaching
                                performance
                            </h1>

                            <p className={`${pageClassName}__hero-subtitle`}>
                                Theo dõi số học viên, tiến độ học tập, hiệu suất
                                quiz, bài tập cần chấm và xuất báo cáo nhanh
                                theo từng khoảng thời gian.
                            </p>
                        </div>

                        <div className={`${pageClassName}__hero-actions`}>
                            <button
                                type="button"
                                onClick={() => loadSummary(filters)}
                                className={`${pageClassName}__refresh-btn`}
                            >
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={handleExportCsv}
                                className={`${pageClassName}__refresh-btn`}
                            >
                                Export CSV
                            </button>

                            <button
                                type="button"
                                onClick={handleExportPdf}
                                className={`${pageClassName}__refresh-btn`}
                            >
                                Export PDF
                            </button>

                            <Link to="/instructor/courses/create">
                                <Button type="button">Create Course</Button>
                            </Link>
                        </div>
                    </div>

                    <div className={`${pageClassName}__hero-metrics`}>
                        <HeroMetric
                            label="Courses"
                            value={summary?.totalCourses || 0}
                            hint="Total teaching courses"
                            pageClassName={pageClassName}
                        />
                        <HeroMetric
                            label="Students"
                            value={summary?.totalStudents || 0}
                            hint="Across all courses"
                            pageClassName={pageClassName}
                        />
                        <HeroMetric
                            label="Enrollments"
                            value={summary?.totalEnrollments || 0}
                            hint={`${summary?.completionRate || 0}% completion rate`}
                            pageClassName={pageClassName}
                        />
                        <HeroMetric
                            label="Revenue"
                            value={summary?.estimatedRevenue || 0}
                            hint="Estimated revenue"
                            pageClassName={pageClassName}
                        />
                    </div>

                    <div className={`${pageClassName}__hero-filter-wrap`}>
                        <div className={`${pageClassName}__filter-bar`}>
                            <div className={`${pageClassName}__filter-field`}>
                                <label
                                    className={`${pageClassName}__mini-label`}
                                >
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={filters.from}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            from: e.target.value,
                                        }))
                                    }
                                    className={`${pageClassName}__filter-input`}
                                />
                            </div>

                            <div className={`${pageClassName}__filter-field`}>
                                <label
                                    className={`${pageClassName}__mini-label`}
                                >
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={filters.to}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            to: e.target.value,
                                        }))
                                    }
                                    className={`${pageClassName}__filter-input`}
                                />
                            </div>

                            <div className={`${pageClassName}__filter-actions`}>
                                <button
                                    type="button"
                                    onClick={handleApplyFilters}
                                    className={`${pageClassName}__refresh-btn`}
                                >
                                    Apply
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className={`${pageClassName}__refresh-btn`}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className={`${pageClassName}__preset-row`}>
                            <button
                                type="button"
                                onClick={() => applyPreset("7d")}
                                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                            >
                                Last 7 days
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset("30d")}
                                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                            >
                                Last 30 days
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset("month")}
                                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                            >
                                This month
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset("year")}
                                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                            >
                                This year
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className={`${pageClassName}__stats`}>
                <EnrollmentStatCard
                    label="Total Courses"
                    value={summary?.totalCourses || 0}
                    hint="Courses currently managed"
                    tone="indigo"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Total Students"
                    value={summary?.totalStudents || 0}
                    hint="Across all your courses"
                    tone="emerald"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Enrollments"
                    value={summary?.totalEnrollments || 0}
                    hint={`${summary?.completionRate || 0}% completion rate`}
                    tone="amber"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Average Quiz Score"
                    value={summary?.averageQuizScore || 0}
                    hint={`${summary?.quizPassRate || 0}% pass rate`}
                    tone="rose"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Pending Grading"
                    value={summary?.pendingAssignmentGradingCount || 0}
                    hint="Assignment submissions waiting"
                    tone="slate"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Unread Chats"
                    value={summary?.unreadConversationCount || 0}
                    hint="Student conversations not opened yet"
                    tone="indigo"
                    pageClassName={pageClassName}
                />
            </div>

            <InstructorDashboardChartsSection
                summary={summary}
                pageClassName={pageClassName}
            />

            <EnrollmentSectionCard
                title="Latest Courses"
                description="Quick access to your newest teaching courses."
                pageClassName={pageClassName}
                action={
                    <Link
                        to="/instructor/courses"
                        className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                    >
                        View all courses
                    </Link>
                }
            >
                {!latestCourses.length ? (
                    <div className={`${pageClassName}__empty-soft`}>
                        No teaching courses yet.
                    </div>
                ) : (
                    <div className={`${pageClassName}__course-list`}>
                        {latestCourses.map((course, index) => (
                            <CourseWideCard
                                key={course?._id || course?.id || index}
                                course={course}
                                pageClassName={pageClassName}
                            />
                        ))}
                    </div>
                )}
            </EnrollmentSectionCard>

            <EnrollmentSectionCard
                title="Teaching Snapshot"
                description="A quick summary of your current instructor workload."
                pageClassName={pageClassName}
            >
                <div className={`${pageClassName}__mini-grid`}>
                    <div className={`${pageClassName}__mini-card`}>
                        <div className={`${pageClassName}__mini-label`}>
                            Courses
                        </div>
                        <div className={`${pageClassName}__mini-value`}>
                            {summary?.totalCourses || 0}
                        </div>
                        <div className={`${pageClassName}__mini-text`}>
                            Total courses in your teaching portfolio
                        </div>
                    </div>

                    <div className={`${pageClassName}__mini-card`}>
                        <div className={`${pageClassName}__mini-label`}>
                            Materials
                        </div>
                        <div className={`${pageClassName}__mini-value`}>
                            {summary?.totalMaterials || 0}
                        </div>
                        <div className={`${pageClassName}__mini-text`}>
                            Uploaded learning resources across all courses
                        </div>
                    </div>

                    <div className={`${pageClassName}__mini-card`}>
                        <div className={`${pageClassName}__mini-label`}>
                            Quizzes
                        </div>
                        <div className={`${pageClassName}__mini-value`}>
                            {summary?.totalQuizzes || 0}
                        </div>
                        <div className={`${pageClassName}__mini-text`}>
                            Total quizzes with {summary?.totalQuizAttempts || 0}{" "}
                            attempts
                        </div>
                    </div>

                    <div className={`${pageClassName}__mini-card`}>
                        <div className={`${pageClassName}__mini-label`}>
                            Assignments
                        </div>
                        <div className={`${pageClassName}__mini-value`}>
                            {summary?.totalAssignments || 0}
                        </div>
                        <div className={`${pageClassName}__mini-text`}>
                            {summary?.totalSubmissions || 0} submissions
                            received
                        </div>
                    </div>

                    <div className={`${pageClassName}__mini-card`}>
                        <div className={`${pageClassName}__mini-label`}>
                            Certificates
                        </div>
                        <div className={`${pageClassName}__mini-value`}>
                            {summary?.certificateCount || 0}
                        </div>
                        <div className={`${pageClassName}__mini-text`}>
                            Certificates issued from your completed courses
                        </div>
                    </div>

                    <div className={`${pageClassName}__mini-card`}>
                        <div className={`${pageClassName}__mini-label`}>
                            Revenue
                        </div>
                        <div className={`${pageClassName}__mini-value`}>
                            {summary?.estimatedRevenue || 0}
                        </div>
                        <div className={`${pageClassName}__mini-text`}>
                            Estimated by enrollments × course effective price
                        </div>
                    </div>
                </div>
            </EnrollmentSectionCard>

            <EnrollmentSectionCard
                title="Top Courses"
                description="Your strongest-performing courses by enrollment volume."
                pageClassName={pageClassName}
            >
                {!topCourses.length ? (
                    <div className={`${pageClassName}__empty-soft`}>
                        No course analytics yet.
                    </div>
                ) : (
                    <div className={`${pageClassName}__course-list`}>
                        {topCourses.map((course, index) => (
                            <CourseWideCard
                                key={course?._id || course?.id || index}
                                course={course}
                                pageClassName={pageClassName}
                            />
                        ))}
                    </div>
                )}
            </EnrollmentSectionCard>

            <EnrollmentSectionCard
                title="6-Month Activity"
                description="Recent enrollments, quiz attempts, and assignment submissions."
                pageClassName={pageClassName}
            >
                {!monthlyTrend.length ? (
                    <div className={`${pageClassName}__empty-soft`}>
                        No monthly trend data yet.
                    </div>
                ) : (
                    <div className={`${pageClassName}__mini-grid`}>
                        {monthlyTrend.map((item) => (
                            <div
                                key={item.key}
                                className={`${pageClassName}__mini-card`}
                            >
                                <div className={`${pageClassName}__mini-label`}>
                                    {item.label}
                                </div>
                                <div className={`${pageClassName}__mini-text`}>
                                    Enrollments: {item.enrollments || 0}
                                </div>
                                <div className={`${pageClassName}__mini-text`}>
                                    Quiz attempts: {item.quizAttempts || 0}
                                </div>
                                <div className={`${pageClassName}__mini-text`}>
                                    Submissions: {item.submissions || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </EnrollmentSectionCard>
        </div>
    );
}
