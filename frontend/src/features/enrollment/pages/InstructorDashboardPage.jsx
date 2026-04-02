import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
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

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function HeroMetric({ label, value, hint, pageClassName }) {
  return (
    <div className={`${pageClassName}__hero-metric`}>
      <div className={`${pageClassName}__hero-metric-label`}>{label}</div>
      <div className={`${pageClassName}__hero-metric-value`}>{value}</div>
      {hint ? (
        <div className={`${pageClassName}__hero-metric-hint`}>{hint}</div>
      ) : null}
    </div>
  );
}

function CourseCard({ course, pageClassName = "" }) {
  return (
    <article className={`${pageClassName}__course-card`}>
      <div className={`${pageClassName}__course-thumb-wrap`}>
        <img
          src={course?.thumbnail || "https://placehold.co/1200x675?text=Course"}
          alt={course?.title || "Course"}
          className={`${pageClassName}__course-thumb`}
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/1200x675?text=Course";
          }}
        />
        <span
          className={`${pageClassName}__course-badge ${
            course?.status === "published"
              ? `${pageClassName}__course-badge--emerald`
              : course?.status === "archived"
              ? `${pageClassName}__course-badge--slate`
              : `${pageClassName}__course-badge--amber`
          }`}
        >
          {course?.status || "draft"}
        </span>
      </div>

      <div className={`${pageClassName}__course-content`}>
        <div className={`${pageClassName}__course-top`}>
          <div>
            <div className={`${pageClassName}__course-category`}>
              {course?.category || "General"}
            </div>
            <h3 className={`${pageClassName}__course-title`}>
              {course?.title || "Course"}
            </h3>
          </div>
        </div>

        <p className={`${pageClassName}__course-text`}>
          {course?.shortDescription ||
            course?.description ||
            "No description available yet."}
        </p>

        <div className={`${pageClassName}__course-metrics`}>
          <div className={`${pageClassName}__course-mini`}>
            <span>Enrollments</span>
            <strong>{formatNumber(course?.totalEnrollments || 0)}</strong>
          </div>
          <div className={`${pageClassName}__course-mini`}>
            <span>Lessons</span>
            <strong>{formatNumber(course?.totalLessons || 0)}</strong>
          </div>
          <div className={`${pageClassName}__course-mini`}>
            <span>Rating</span>
            <strong>{course?.rating || 0}</strong>
          </div>
          <div className={`${pageClassName}__course-mini`}>
            <span>Revenue</span>
            <strong>{formatMoney(course?.estimatedRevenue || 0)}</strong>
          </div>
        </div>

        <div className={`${pageClassName}__course-actions`}>
          <Link
            to={`/instructor/courses/${course?._id || course?.id}/lessons`}
            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--primary`}
          >
            Manage course
          </Link>
          <Link
            to={`/instructor/courses/${course?._id || course?.id}/students`}
            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--soft`}
          >
            Students
          </Link>
        </div>
      </div>
    </article>
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

  const topCourses = Array.isArray(summary?.topCourses) ? summary.topCourses : [];

  async function handleExportCsv() {
    try {
      const blob = await exportInstructorDashboardCsv(instructorId, filters);
      downloadBlob(blob, "instructor-dashboard-report.csv");
      setToast({
        message: "Instructor dashboard CSV exported successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to export instructor dashboard CSV",
        kind: "error",
      });
    }
  }

  async function handleExportPdf() {
    try {
      const blob = await exportInstructorDashboardPdf(instructorId, filters);
      downloadBlob(blob, "instructor-dashboard-report.pdf");
      setToast({
        message: "Instructor dashboard PDF exported successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to export instructor dashboard PDF",
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

      <section className={`${pageClassName}__hero-shell`}>
        <div className={`${pageClassName}__hero-panel`}>
          <div className={`${pageClassName}__hero-glow ${pageClassName}__hero-glow--one`} />
          <div className={`${pageClassName}__hero-glow ${pageClassName}__hero-glow--two`} />

          <div className={`${pageClassName}__hero-top`}>
            <div className={`${pageClassName}__hero-copy`}>
              <div className={`${pageClassName}__eyebrow`}>
                Instructor Dashboard
              </div>

              <h1 className={`${pageClassName}__hero-title`}>
                Manage teaching performance with clarity and speed
              </h1>

              <p className={`${pageClassName}__hero-subtitle`}>
                Theo dõi số học viên, tiến độ học tập, hiệu suất quiz, bài tập
                cần chấm và xuất báo cáo nhanh theo từng khoảng thời gian trong
                một dashboard gọn, hiện đại và trực quan hơn.
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
              value={formatNumber(summary?.totalCourses || 0)}
              hint="Active teaching portfolio"
              pageClassName={pageClassName}
            />
            <HeroMetric
              label="Students"
              value={formatNumber(summary?.totalStudents || 0)}
              hint="Across all active classes"
              pageClassName={pageClassName}
            />
            <HeroMetric
              label="Enrollments"
              value={formatNumber(summary?.totalEnrollments || 0)}
              hint={`${summary?.completionRate || 0}% completion rate`}
              pageClassName={pageClassName}
            />
            <HeroMetric
              label="Revenue"
              value={formatMoney(summary?.estimatedRevenue || 0)}
              hint="Estimated from course enrollments"
              pageClassName={pageClassName}
            />
          </div>

          <div className={`${pageClassName}__hero-filter-wrap`}>
            <div className={`${pageClassName}__filter-bar`}>
              <div className={`${pageClassName}__filter-field`}>
                <label className={`${pageClassName}__mini-label`}>From</label>
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
                <label className={`${pageClassName}__mini-label`}>To</label>
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
          value={formatNumber(summary?.totalCourses || 0)}
          hint="Courses currently managed"
          tone="indigo"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Total Students"
          value={formatNumber(summary?.totalStudents || 0)}
          hint="Across all your courses"
          tone="emerald"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Enrollments"
          value={formatNumber(summary?.totalEnrollments || 0)}
          hint={`${summary?.completionRate || 0}% completion rate`}
          tone="amber"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Average Quiz Score"
          value={formatNumber(summary?.averageQuizScore || 0)}
          hint={`${summary?.quizPassRate || 0}% pass rate`}
          tone="rose"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Pending Grading"
          value={formatNumber(summary?.pendingAssignmentGradingCount || 0)}
          hint="Assignment submissions waiting"
          tone="slate"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Unread Chats"
          value={formatNumber(summary?.unreadConversationCount || 0)}
          hint="Student conversations not opened yet"
          tone="indigo"
          pageClassName={pageClassName}
        />
      </div>

      <InstructorDashboardChartsSection
        summary={summary}
        pageClassName={pageClassName}
      />

      <div className={`${pageClassName}__content-grid`}>
        <EnrollmentSectionCard
          title="Latest Courses"
          description="Quick access to your newest teaching courses."
          pageClassName={pageClassName}
          action={
            <Link
              to="/instructor/courses"
              className={`${pageClassName}__link-btn ${pageClassName}__link-btn--soft`}
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
            <div className={`${pageClassName}__course-grid`}>
              {latestCourses.map((course, index) => (
                <CourseCard
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
              <div className={`${pageClassName}__mini-label`}>Courses</div>
              <div className={`${pageClassName}__mini-value`}>
                {formatNumber(summary?.totalCourses || 0)}
              </div>
              <div className={`${pageClassName}__mini-text`}>
                Total courses in your teaching portfolio
              </div>
            </div>

            <div className={`${pageClassName}__mini-card`}>
              <div className={`${pageClassName}__mini-label`}>Materials</div>
              <div className={`${pageClassName}__mini-value`}>
                {formatNumber(summary?.totalMaterials || 0)}
              </div>
              <div className={`${pageClassName}__mini-text`}>
                Uploaded learning resources across all courses
              </div>
            </div>

            <div className={`${pageClassName}__mini-card`}>
              <div className={`${pageClassName}__mini-label`}>Quizzes</div>
              <div className={`${pageClassName}__mini-value`}>
                {formatNumber(summary?.totalQuizzes || 0)}
              </div>
              <div className={`${pageClassName}__mini-text`}>
                {formatNumber(summary?.totalQuizAttempts || 0)} attempts
                recorded
              </div>
            </div>

            <div className={`${pageClassName}__mini-card`}>
              <div className={`${pageClassName}__mini-label`}>Assignments</div>
              <div className={`${pageClassName}__mini-value`}>
                {formatNumber(summary?.totalAssignments || 0)}
              </div>
              <div className={`${pageClassName}__mini-text`}>
                {formatNumber(summary?.totalSubmissions || 0)} submissions
                received
              </div>
            </div>

            <div className={`${pageClassName}__mini-card`}>
              <div className={`${pageClassName}__mini-label`}>Certificates</div>
              <div className={`${pageClassName}__mini-value`}>
                {formatNumber(summary?.certificateCount || 0)}
              </div>
              <div className={`${pageClassName}__mini-text`}>
                Certificates issued from completed courses
              </div>
            </div>

            <div className={`${pageClassName}__mini-card`}>
              <div className={`${pageClassName}__mini-label`}>Revenue</div>
              <div className={`${pageClassName}__mini-value`}>
                {formatMoney(summary?.estimatedRevenue || 0)}
              </div>
              <div className={`${pageClassName}__mini-text`}>
                Estimated from enrollments × course effective price
              </div>
            </div>
          </div>
        </EnrollmentSectionCard>
      </div>

      <EnrollmentSectionCard
        title="Top Course Performance"
        description="Your strongest performing courses by enrollments and revenue."
        pageClassName={pageClassName}
      >
        {!topCourses.length ? (
          <div className={`${pageClassName}__empty-soft`}>
            No top course data yet.
          </div>
        ) : (
          <div className={`${pageClassName}__rank-list`}>
            {topCourses.slice(0, 5).map((course, index) => (
              <div
                key={course?._id || course?.id || index}
                className={`${pageClassName}__rank-item`}
              >
                <div className={`${pageClassName}__rank-badge`}>
                  #{index + 1}
                </div>

                <div className={`${pageClassName}__rank-main`}>
                  <div className={`${pageClassName}__rank-title`}>
                    {course?.title || "Course"}
                  </div>
                  <div className={`${pageClassName}__rank-subtitle`}>
                    {course?.category || "General"} •{" "}
                    {formatNumber(course?.totalEnrollments || 0)} enrollments •{" "}
                    {course?.completionRate || 0}% completion
                  </div>
                </div>

                <div className={`${pageClassName}__rank-metric`}>
                  <div className={`${pageClassName}__rank-metric-value`}>
                    {formatMoney(course?.estimatedRevenue || 0)}
                  </div>
                  <div className={`${pageClassName}__rank-metric-label`}>
                    Revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </EnrollmentSectionCard>
    </div>
  );
}