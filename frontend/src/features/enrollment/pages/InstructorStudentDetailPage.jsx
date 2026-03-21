import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import EnrollmentPageHero from "../components/EnrollmentPageHero";
import EnrollmentStatCard from "../components/EnrollmentStatCard";
import StudentAssignmentSubmissionList from "../components/StudentAssignmentSubmissionList";
import StudentDetailHero from "../components/StudentDetailHero";
import StudentLessonProgressList from "../components/StudentLessonProgressList";
import StudentQuizAttemptList from "../components/StudentQuizAttemptList";
import useInstructorStudentDetailPage from "../hooks/useInstructorStudentDetailPage";
import "../styles/instructor-student-detail-page.css";

export default function InstructorStudentDetailPage() {
  const pageClassName = "instructor-student-detail-page";
  const {
    courseId,
    studentId,
    loading,
    toast,
    setToast,
    loadData,
    enrollment,
    student,
    studentName,
    course,
    progress,
    lessons,
    completedLessonIds,
    quizAttempts,
    assignmentSubmissions,
    stats,
    hasEnrollment,
  } = useInstructorStudentDetailPage();

  if (loading) {
    return (
      <div className={pageClassName}>
        <div className={`${pageClassName}__state-card`}>
          Đang tải chi tiết học viên...
        </div>
      </div>
    );
  }

  if (!hasEnrollment) {
    return (
      <div className={pageClassName}>
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <div className={`${pageClassName}__empty-card`}>
          <h1 className={`${pageClassName}__empty-title`}>
            Không tìm thấy dữ liệu học viên
          </h1>
          <p className={`${pageClassName}__empty-text`}>
            Có thể học viên chưa đăng ký khóa học này hoặc dữ liệu chưa sẵn sàng.
          </p>
          <div className={`${pageClassName}__empty-actions`}>
            <Link to={`/instructor/courses/${courseId}/students`}>
              <Button type="button">Quay lại danh sách học viên</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <EnrollmentPageHero
        eyebrow="Student Analytics"
        title="Chi tiết học viên"
        description="Theo dõi tiến độ học tập, quiz và assignment của học viên trong khóa học."
        pageClassName={pageClassName}
        actions={
          <>
            <button
              type="button"
              onClick={loadData}
              className={`${pageClassName}__refresh-btn`}
            >
              Refresh
            </button>

            <Link to={`/instructor/courses/${courseId}/chat?studentId=${studentId}`}>
              <Button type="button">Chat</Button>
            </Link>

            <Link to={`/instructor/courses/${courseId}/students`}>
              <Button type="button">Back to students</Button>
            </Link>
          </>
        }
      />

      <StudentDetailHero
        studentName={studentName}
        student={student}
        course={course}
        progress={progress}
        enrollment={enrollment}
        pageClassName={pageClassName}
      />

      <div className={`${pageClassName}__stats`}>
        <EnrollmentStatCard
          label="Completed lessons"
          value={stats.completedLessonsCount}
          tone="emerald"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Total lessons"
          value={stats.totalLessons}
          tone="indigo"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Quiz attempts"
          value={stats.quizAttemptsCount}
          tone="amber"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          label="Assignment submissions"
          value={stats.assignmentSubmissionsCount}
          tone="rose"
          pageClassName={pageClassName}
        />
      </div>

      <div className={`${pageClassName}__metric-grid`}>
        <div className={`${pageClassName}__metric-card`}>
          <div className={`${pageClassName}__metric-label`}>
            Average quiz score
          </div>
          <div className={`${pageClassName}__metric-value`}>
            {stats.averageQuizScore}
          </div>
        </div>

        <div className={`${pageClassName}__metric-card`}>
          <div className={`${pageClassName}__metric-label`}>Passed quizzes</div>
          <div
            className={`${pageClassName}__metric-value ${pageClassName}__metric-value--emerald`}
          >
            {stats.passedQuizCount}
          </div>
        </div>

        <div className={`${pageClassName}__metric-card`}>
          <div className={`${pageClassName}__metric-label`}>
            Graded assignments
          </div>
          <div
            className={`${pageClassName}__metric-value ${pageClassName}__metric-value--indigo`}
          >
            {stats.gradedAssignmentsCount}
          </div>
        </div>
      </div>

      <StudentLessonProgressList
        lessons={lessons}
        completedLessonIds={completedLessonIds}
        enrollment={enrollment}
        pageClassName={pageClassName}
      />

      <StudentQuizAttemptList
        quizAttempts={quizAttempts}
        pageClassName={pageClassName}
      />

      <StudentAssignmentSubmissionList
        assignmentSubmissions={assignmentSubmissions}
        pageClassName={pageClassName}
      />
    </div>
  );
}