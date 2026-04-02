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

function formatFriendlyDate(value) {
  if (!value) return "No recent activity";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFriendlyDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAchievementLabel(type) {
  const key = String(type || "");

  if (key === "complete_lesson") return "Completed a lesson";
  if (key === "complete_course") return "Completed a course";
  if (key === "pass_quiz") return "Passed a quiz";
  if (key === "submit_assignment") return "Submitted an assignment";
  if (key === "earn_certificate") return "Earned a certificate";

  return "Learning activity";
}

export default function StudentDashboardPage() {
  const pageClassName = "student-dashboard-page";
  const {
    loading,
    summary,
    analytics,
    gamification,
    gamificationEvents,
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

  const completionRate = Number(analytics?.completionRate || 0);
  const averageProgress = Number(analytics?.averageProgress || 0);
  const currentStreak = Number(
    analytics?.currentStreak ?? gamification?.currentStreak ?? 0
  );
  const bestStreak = Number(
    analytics?.bestStreak ?? gamification?.bestStreak ?? 0
  );
  const level = Number(gamification?.level || 1);
  const xp = Number(gamification?.xp || 0);
  const badges = Array.isArray(gamification?.badgeIds)
    ? gamification.badgeIds
    : [];
  const achievements = Array.isArray(gamificationEvents)
    ? gamificationEvents.slice(0, 5)
    : [];

  const pendingTasks =
    Number(summary?.pendingQuizCount || 0) +
    Number(summary?.pendingAssignmentCount || 0);

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
        message: error?.message || "Failed to export student analytics CSV",
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
        title="Your Learning Command Center"
        description="Track performance, keep momentum, and continue learning with a cleaner, smarter dashboard experience."
        pageClassName={pageClassName}
        actions={
          <div className={`${pageClassName}__hero-panel`}>
            <div className={`${pageClassName}__hero-panel-top`}>
              <div>
                <div className={`${pageClassName}__hero-panel-kicker`}>
                  Performance Snapshot
                </div>
                <div className={`${pageClassName}__hero-panel-title`}>
                  Focused. Consistent. Moving forward.
                </div>
                <div className={`${pageClassName}__hero-panel-subtitle`}>
                  Completion, streak, and engagement at a glance.
                </div>
              </div>

              <div
                className={`${pageClassName}__hero-progress-ring`}
                style={{ "--progress": `${completionRate}%` }}
              >
                <div className={`${pageClassName}__hero-progress-inner`}>
                  <span className={`${pageClassName}__hero-progress-value`}>
                    {completionRate}%
                  </span>
                  <span className={`${pageClassName}__hero-progress-label`}>
                    completed
                  </span>
                </div>
              </div>
            </div>

            <div className={`${pageClassName}__hero-kpi-grid`}>
              <div className={`${pageClassName}__hero-kpi`}>
                <div className={`${pageClassName}__hero-kpi-label`}>
                  Current streak
                </div>
                <div className={`${pageClassName}__hero-kpi-value`}>
                  {currentStreak} days
                </div>
                <div className={`${pageClassName}__hero-kpi-meta`}>
                  Best streak: {bestStreak} days
                </div>
              </div>

              <div className={`${pageClassName}__hero-kpi`}>
                <div className={`${pageClassName}__hero-kpi-label`}>
                  Learner level
                </div>
                <div className={`${pageClassName}__hero-kpi-value`}>
                  Level {level}
                </div>
                <div className={`${pageClassName}__hero-kpi-meta`}>
                  {xp} XP earned
                </div>
              </div>

              <div className={`${pageClassName}__hero-kpi`}>
                <div className={`${pageClassName}__hero-kpi-label`}>
                  Average progress
                </div>
                <div className={`${pageClassName}__hero-kpi-value`}>
                  {averageProgress}%
                </div>
                <div className={`${pageClassName}__hero-kpi-meta`}>
                  {summary?.totalInProgressCourses || 0} active course(s)
                </div>
              </div>
            </div>
          </div>
        }
      />

      <EnrollmentSectionCard
        title="Analytics & Date Range"
        description="Refine the dashboard by period, then export your learning report when needed."
        pageClassName={pageClassName}
        action={
          <button
            type="button"
            onClick={handleExportCsv}
            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--soft`}
          >
            Export CSV
          </button>
        }
      >
        <div className={`${pageClassName}__filter-shell`}>
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
                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--primary`}
              >
                Apply filters
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--ghost`}
              >
                Reset
              </button>
            </div>
          </div>

          <div className={`${pageClassName}__preset-row`}>
            <button
              type="button"
              onClick={() => applyPreset("7d")}
              className={`${pageClassName}__link-btn ${pageClassName}__link-btn--soft`}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => applyPreset("30d")}
              className={`${pageClassName}__link-btn ${pageClassName}__link-btn--soft`}
            >
              Last 30 days
            </button>
            <button
              type="button"
              onClick={() => applyPreset("month")}
              className={`${pageClassName}__link-btn ${pageClassName}__link-btn--soft`}
            >
              This month
            </button>
            <button
              type="button"
              onClick={() => applyPreset("year")}
              className={`${pageClassName}__link-btn ${pageClassName}__link-btn--soft`}
            >
              This year
            </button>
          </div>
        </div>
      </EnrollmentSectionCard>

      <div className={`${pageClassName}__stats`}>
        <EnrollmentStatCard
          label="Enrolled Courses"
          value={summary?.totalEnrolledCourses || 0}
          hint="All active and finished enrollments"
          tone="indigo"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="In Progress"
          value={summary?.totalInProgressCourses || 0}
          hint="Courses currently being studied"
          tone="amber"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Completed Courses"
          value={summary?.totalCompletedCourses || 0}
          hint="Successfully finished courses"
          tone="emerald"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Certificates"
          value={summary?.certificateCount || 0}
          hint="Ready to view or download"
          tone="rose"
          pageClassName={pageClassName}
        />
      </div>

      <div className={`${pageClassName}__stats ${pageClassName}__stats--three`}>
        <EnrollmentStatCard
          label="Lessons Done"
          value={`${summary?.totalCompletedLessons || 0}/${summary?.totalLessonCount || 0}`}
          hint="Completed lessons across all courses"
          tone="emerald"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Pending Quizzes"
          value={summary?.pendingQuizCount || 0}
          hint="Quiz attempts still waiting"
          tone="amber"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Pending Assignments"
          value={summary?.pendingAssignmentCount || 0}
          hint="Assignments awaiting submission"
          tone="slate"
          pageClassName={pageClassName}
        />
      </div>

      <div className={`${pageClassName}__overview-grid`}>
        <div className={`${pageClassName}__overview-main`}>
          <StudentLearningAnalyticsSection
            analytics={analytics}
            pageClassName={pageClassName}
          />

          <StudentLearningTrendSection
            weeklyTrend={weeklyTrend}
            monthlyTrend={monthlyTrend}
            pageClassName={pageClassName}
          />
        </div>

        <div className={`${pageClassName}__overview-side`}>
          <EnrollmentSectionCard
            title="Learning Momentum"
            description="A compact snapshot of how steadily you're progressing."
            pageClassName={pageClassName}
          >
            <div className={`${pageClassName}__momentum-wrap`}>
              <div className={`${pageClassName}__momentum-ring-block`}>
                <div
                  className={`${pageClassName}__metric-ring`}
                  style={{ "--progress": `${completionRate}%` }}
                >
                  <div className={`${pageClassName}__metric-ring-inner`}>
                    <div className={`${pageClassName}__metric-ring-value`}>
                      {completionRate}%
                    </div>
                    <div className={`${pageClassName}__metric-ring-label`}>
                      Completion
                    </div>
                  </div>
                </div>

                <div className={`${pageClassName}__momentum-text`}>
                  <div className={`${pageClassName}__momentum-title`}>
                    Learning is moving well
                  </div>
                  <div className={`${pageClassName}__momentum-subtitle`}>
                    {pendingTasks > 0
                      ? `${pendingTasks} pending task(s) still need your attention.`
                      : "You are currently on track with no pending tasks."}
                  </div>
                </div>
              </div>

              <div className={`${pageClassName}__metric-grid`}>
                <div className={`${pageClassName}__metric-item`}>
                  <div className={`${pageClassName}__metric-label`}>XP</div>
                  <div className={`${pageClassName}__metric-value`}>{xp}</div>
                  <div className={`${pageClassName}__metric-note`}>
                    Total points earned
                  </div>
                </div>

                <div className={`${pageClassName}__metric-item`}>
                  <div className={`${pageClassName}__metric-label`}>Level</div>
                  <div className={`${pageClassName}__metric-value`}>
                    {level}
                  </div>
                  <div className={`${pageClassName}__metric-note`}>
                    Current learner level
                  </div>
                </div>

                <div className={`${pageClassName}__metric-item`}>
                  <div className={`${pageClassName}__metric-label`}>
                    Badges
                  </div>
                  <div className={`${pageClassName}__metric-value`}>
                    {badges.length}
                  </div>
                  <div className={`${pageClassName}__metric-note`}>
                    Achievements unlocked
                  </div>
                </div>

                <div className={`${pageClassName}__metric-item`}>
                  <div className={`${pageClassName}__metric-label`}>
                    Last active
                  </div>
                  <div className={`${pageClassName}__metric-value ${pageClassName}__metric-value--small`}>
                    {formatFriendlyDate(analytics?.lastActiveDate)}
                  </div>
                  <div className={`${pageClassName}__metric-note`}>
                    Most recent learning activity
                  </div>
                </div>
              </div>
            </div>
          </EnrollmentSectionCard>

          <EnrollmentSectionCard
            title="Recent Achievements"
            description="Your most recent learning milestones and XP moments."
            pageClassName={pageClassName}
          >
            {!achievements.length ? (
              <div className={`${pageClassName}__empty-soft`}>
                No recent achievements yet. Keep going to unlock more progress.
              </div>
            ) : (
              <div className={`${pageClassName}__activity-list`}>
                {achievements.map((item, index) => (
                  <div
                    key={item?._id || `${item?.type || "event"}-${index}`}
                    className={`${pageClassName}__activity-item`}
                  >
                    <div className={`${pageClassName}__activity-icon`}>
                      {item?.type === "earn_certificate"
                        ? "🏆"
                        : item?.type === "complete_course"
                        ? "🎓"
                        : item?.type === "pass_quiz"
                        ? "✅"
                        : item?.type === "submit_assignment"
                        ? "📝"
                        : "🔥"}
                    </div>

                    <div className={`${pageClassName}__activity-main`}>
                      <div className={`${pageClassName}__activity-title`}>
                        {getAchievementLabel(item?.type)}
                      </div>
                      <div className={`${pageClassName}__activity-time`}>
                        {formatFriendlyDateTime(item?.createdAt)}
                      </div>
                    </div>

                    <div className={`${pageClassName}__activity-xp`}>
                      +{item?.xpEarned || 0} XP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </EnrollmentSectionCard>
        </div>
      </div>

      <EnrollmentSectionCard
        title="Continue Learning"
        description="Jump back into the courses you were working on recently."
        pageClassName={pageClassName}
        action={
          <Link
            to="/my-courses"
            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--dark`}
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