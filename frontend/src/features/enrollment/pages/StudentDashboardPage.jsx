import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import EnrollmentPageHero from "../components/EnrollmentPageHero";
import EnrollmentSectionCard from "../components/EnrollmentSectionCard";
import EnrollmentStatCard from "../components/EnrollmentStatCard";
import StudentCourseCard from "../components/StudentCourseCard";
import StudentLearningAnalyticsSection from "../components/StudentLearningAnalyticsSection";
import StudentLearningTrendSection from "../components/StudentLearningTrendSection";
import { exportStudentAnalyticsCsv } from "../services/enrollment.service";
import useStudentDashboardPage from "../hooks/useStudentDashboardPage";
import "../styles/student-dashboard-page.css";

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

export default function StudentDashboardPage() {
    const pageClassName = "student-dashboard-page";
    const {
        loading,
        summary,
        analytics,
        continueCourses,
        weeklyTrend,
        monthlyTrend,
        filters,
        setFilters,
        applyPreset,
        resetFilters,
        toast,
        setToast,
        loadSummary,
        studentId,
    } = useStudentDashboardPage();

    if (loading) {
        return (
            <div className={pageClassName}>
                <div className={`${pageClassName}__state-card`}>
                    Loading dashboard...
                </div>
            </div>
        );
    }

    async function handleExportCsv() {
        try {
            const blob = await exportStudentAnalyticsCsv(studentId, filters);
            downloadBlob(blob, "student-learning-analytics-report.csv");
            setToast({
                message: "Student analytics CSV exported successfully",
                kind: "success",
            });
        } catch (error) {
            setToast({
                message:
                    error?.message || "Failed to export student analytics CSV",
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

            <EnrollmentPageHero
                eyebrow="Student Dashboard"
                title="Learning Overview"
                description="Track your progress, study activity, achievements, and keep learning efficiently."
                pageClassName={pageClassName}
            />

            <EnrollmentSectionCard
                title="Analytics Filter"
                description="Filter learning analytics by date range."
                pageClassName={pageClassName}
                action={
                    <button
                        type="button"
                        onClick={handleExportCsv}
                        className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                    >
                        Export CSV
                    </button>
                }
            >
                <div className={`${pageClassName}__filter-bar`}>
                    <div className={`${pageClassName}__filter-field`}>
                        <label className={`${pageClassName}__mini-label`}>
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
                        <label className={`${pageClassName}__mini-label`}>
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
                            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
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
            </EnrollmentSectionCard>

            <div className={`${pageClassName}__stats`}>
                <EnrollmentStatCard
                    label="Enrolled Courses"
                    value={summary?.totalEnrolledCourses || 0}
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="In Progress"
                    value={summary?.totalInProgressCourses || 0}
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Completed Courses"
                    value={summary?.totalCompletedCourses || 0}
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Certificates"
                    value={summary?.certificateCount || 0}
                    pageClassName={pageClassName}
                />
            </div>

            <div
                className={`${pageClassName}__stats ${pageClassName}__stats--three`}
            >
                <EnrollmentStatCard
                    label="Lessons Done"
                    value={`${summary?.totalCompletedLessons || 0}/${summary?.totalLessonCount || 0}`}
                    hint="Completed lessons across all enrolled courses"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Pending Quizzes"
                    value={summary?.pendingQuizCount || 0}
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Pending Assignments"
                    value={summary?.pendingAssignmentCount || 0}
                    pageClassName={pageClassName}
                />
            </div>

            <StudentLearningAnalyticsSection
                analytics={analytics}
                pageClassName={pageClassName}
            />

            <StudentLearningTrendSection
                weeklyTrend={weeklyTrend}
                monthlyTrend={monthlyTrend}
                pageClassName={pageClassName}
            />

            <EnrollmentSectionCard
                title="Continue Learning"
                description="Pick up where you left off."
                pageClassName={pageClassName}
                action={
                    <Link
                        to="/my-courses"
                        className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
                    >
                        View all my courses
                    </Link>
                }
            >
                {!continueCourses.length ? (
                    <div className={`${pageClassName}__empty-soft`}>
                        No courses available yet.
                    </div>
                ) : (
                    <div className={`${pageClassName}__course-grid`}>
                        {continueCourses.map((course, index) => (
                            <StudentCourseCard
                                key={
                                    course?.enrollmentId ||
                                    course?.courseId ||
                                    course?._id ||
                                    index
                                }
                                course={course}
                                pageClassName={pageClassName}
                            />
                        ))}
                    </div>
                )}
            </EnrollmentSectionCard>
        </div>
    );
}
