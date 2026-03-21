import React from "react";
import Toast from "../../../shared/components/Toast";
import LessonFormCard from "../components/LessonFormCard";
import LessonHeader from "../components/LessonHeader";
import LessonListCard from "../components/LessonListCard";
import LessonPreviewCard from "../components/LessonPreviewCard";
import LessonStatCard from "../components/LessonStatCard";
import useInstructorLessonManagePage from "../hooks/useInstructorLessonManagePage";
import "../styles/instructor-lesson-manage-page.css";

export default function InstructorLessonManagePage() {
  const pageClassName = "instructor-lesson-manage-page";

  const {
    courseId,
    course,
    lessons,
    loading,
    saving,
    deletingId,
    editingLessonId,
    form,
    toast,
    setToast,
    stats,
    handleChange,
    handleEdit,
    handleSubmit,
    handleDelete,
    resetForm,
  } = useInstructorLessonManagePage();

  if (loading) {
    return (
      <div className={pageClassName}>
        <div className={`${pageClassName}__loading`}>
          <h1 className={`${pageClassName}__loading-title`}>
            Loading lessons...
          </h1>
          <p className={`${pageClassName}__loading-text`}>
            Please wait while we fetch lesson information.
          </p>
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

      <LessonHeader
        courseId={courseId}
        courseTitle={course?.title}
        pageClassName={pageClassName}
      />

      <section className={`${pageClassName}__stats`}>
        <LessonStatCard
          label="Total lessons"
          value={stats.totalLessons}
          hint="Tổng số bài học trong khóa"
          tone="indigo"
          pageClassName={pageClassName}
        />
        <LessonStatCard
          label="Published"
          value={stats.publishedLessons}
          hint="Bài học đang hiển thị"
          tone="emerald"
          pageClassName={pageClassName}
        />
        <LessonStatCard
          label="Preview lessons"
          value={stats.previewLessons}
          hint="Bài học cho phép xem trước"
          tone="amber"
          pageClassName={pageClassName}
        />
        <LessonStatCard
          label="Total duration"
          value={stats.totalDurationLabel}
          hint="Tổng thời lượng khóa học"
          tone="rose"
          pageClassName={pageClassName}
        />
      </section>

      <div className={`${pageClassName}__content`}>
        <div className={`${pageClassName}__left`}>
          <LessonFormCard
            form={form}
            editingLessonId={editingLessonId}
            saving={saving}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={resetForm}
            pageClassName={pageClassName}
          />

          <LessonPreviewCard form={form} pageClassName={pageClassName} />
        </div>

        <LessonListCard
          lessons={lessons}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pageClassName={pageClassName}
        />
      </div>
    </div>
  );
}