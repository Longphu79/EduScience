import Toast from "../../../shared/components/Toast";
import CurrentLessonPanel from "../components/CurrentLessonPanel";
import LearnCourseHero from "../components/LearnCourseHero";
import LearnTabsPanel from "../components/LearnTabsPanel";
import LessonSidebar from "../components/LessonSidebar";
import useLearnCoursePage from "../hooks/useLearnCoursePage";
import "../styles/learn-course-page.css";

export default function LearnCoursePage() {
  const pageClassName = "learn-course-page";
  const {
    courseId,
    activeTab,
    course,
    currentLesson,
    certificate,
    loading,
    actionLoading,
    certificateLoading,
    toast,
    setToast,
    lessons,
    completedLessonIds,
    progress,
    nextLesson,
    currentLessonCompleted,
    completedCount,
    totalLessons,
    handleChangeTab,
    handleOpenInstructorChat,
    handleSelectLesson,
    handleCompleteLesson,
    handleGenerateCertificate,
  } = useLearnCoursePage();

  if (loading) {
    return (
      <div className={pageClassName}>
        <div className={`${pageClassName}__state-card`}>
          Đang tải nội dung học...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={pageClassName}>
        <div className={`${pageClassName}__state-card`}>
          Không tìm thấy khóa học.
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

      <LearnCourseHero
        course={course}
        progress={progress}
        completedCount={completedCount}
        totalLessons={totalLessons}
        nextLesson={nextLesson}
        pageClassName={pageClassName}
      />

      <div className={`${pageClassName}__layout`}>
        <LessonSidebar
          lessons={lessons}
          currentLesson={currentLesson}
          completedLessonIds={completedLessonIds}
          onSelectLesson={handleSelectLesson}
          pageClassName={pageClassName}
        />

        <main className={`${pageClassName}__main`}>
          <CurrentLessonPanel
            currentLesson={currentLesson}
            currentLessonCompleted={currentLessonCompleted}
            nextLesson={nextLesson}
            actionLoading={actionLoading}
            progress={progress}
            certificate={certificate}
            certificateLoading={certificateLoading}
            courseId={courseId}
            onOpenInstructorChat={handleOpenInstructorChat}
            onCompleteLesson={handleCompleteLesson}
            onGenerateCertificate={handleGenerateCertificate}
            pageClassName={pageClassName}
          />

          <LearnTabsPanel
            activeTab={activeTab}
            onChangeTab={handleChangeTab}
            onSelectLesson={handleSelectLesson}
            courseId={courseId}
            lessons={lessons}
            currentLesson={currentLesson}
            completedLessonIds={completedLessonIds}
            pageClassName={pageClassName}
          />
        </main>
      </div>
    </div>
  );
}