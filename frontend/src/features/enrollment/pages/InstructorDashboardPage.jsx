import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import CourseWideCard from "../components/CourseWideCard";
import EnrollmentPageHero from "../components/EnrollmentPageHero";
import EnrollmentSectionCard from "../components/EnrollmentSectionCard";
import EnrollmentStatCard from "../components/EnrollmentStatCard";
import useInstructorDashboardPage from "../hooks/useInstructorDashboardPage";
import "../styles/instructor-dashboard-page.css";

export default function InstructorDashboardPage() {
  const pageClassName = "instructor-dashboard-page";
  const {
    booting,
    loading,
    summary,
    latestCourses,
    toast,
    setToast,
    loadSummary,
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

  return (
    <div className={pageClassName}>
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <section className={`${pageClassName}__hero`}>
        <div className={`${pageClassName}__hero-bg`}>
          <EnrollmentPageHero
            eyebrow="Instructor Dashboard"
            title="Teaching Overview"
            description="Monitor your courses, student activity, grading workload, and unread conversations in one place."
            pageClassName={pageClassName}
            actions={
              <>
                <button
                  type="button"
                  onClick={loadSummary}
                  className={`${pageClassName}__refresh-btn`}
                >
                  Refresh
                </button>

                <Link to="/instructor/courses/create">
                  <Button type="button">Create Course</Button>
                </Link>
              </>
            }
          />
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
          label="Quiz Review"
          value={summary?.pendingQuizReviewCount || 0}
          hint="Courses with quiz activity"
          tone="amber"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Pending Grading"
          value={summary?.pendingAssignmentGradingCount || 0}
          hint="Assignment submissions waiting"
          tone="rose"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Unread Chats"
          value={summary?.unreadConversationCount || 0}
          hint="Student conversations not opened yet"
          tone="slate"
          pageClassName={pageClassName}
        />
      </div>

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
            <div className={`${pageClassName}__mini-label`}>Courses</div>
            <div className={`${pageClassName}__mini-value`}>
              {summary?.totalCourses || 0}
            </div>
            <div className={`${pageClassName}__mini-text`}>
              Total courses in your teaching portfolio
            </div>
          </div>

          <div className={`${pageClassName}__mini-card`}>
            <div className={`${pageClassName}__mini-label`}>Students</div>
            <div className={`${pageClassName}__mini-value`}>
              {summary?.totalStudents || 0}
            </div>
            <div className={`${pageClassName}__mini-text`}>
              Learners actively enrolled in your courses
            </div>
          </div>

          <div className={`${pageClassName}__mini-card`}>
            <div className={`${pageClassName}__mini-label`}>
              Assignment Queue
            </div>
            <div className={`${pageClassName}__mini-value`}>
              {summary?.pendingAssignmentGradingCount || 0}
            </div>
            <div className={`${pageClassName}__mini-text`}>
              Submissions waiting for grading
            </div>
          </div>

          <div className={`${pageClassName}__mini-card`}>
            <div className={`${pageClassName}__mini-label`}>
              Conversations
            </div>
            <div className={`${pageClassName}__mini-value`}>
              {summary?.unreadConversationCount || 0}
            </div>
            <div className={`${pageClassName}__mini-text`}>
              Unread student messages to respond to
            </div>
          </div>
        </div>
      </EnrollmentSectionCard>
    </div>
  );
}