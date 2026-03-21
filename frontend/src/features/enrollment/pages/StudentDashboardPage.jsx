import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import EnrollmentPageHero from "../components/EnrollmentPageHero";
import EnrollmentSectionCard from "../components/EnrollmentSectionCard";
import EnrollmentStatCard from "../components/EnrollmentStatCard";
import StudentCourseCard from "../components/StudentCourseCard";
import useStudentDashboardPage from "../hooks/useStudentDashboardPage";
import "../styles/student-dashboard-page.css";

export default function StudentDashboardPage() {
  const pageClassName = "student-dashboard-page";
  const { loading, summary, continueCourses, toast, setToast } =
    useStudentDashboardPage();

  if (loading) {
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

      <EnrollmentPageHero
        eyebrow="Student Dashboard"
        title="Learning Overview"
        description="Track your progress, pending tasks, and keep learning efficiently."
        pageClassName={pageClassName}
      />

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

      <div className={`${pageClassName}__stats ${pageClassName}__stats--three`}>
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
                key={course?.enrollmentId || course?.courseId || course?._id || index}
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