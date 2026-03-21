import Toast from "../../../shared/components/Toast";
import EditCourseHero from "../components/EditCourseHero";
import CourseEditorForm from "../components/CourseEditorForm";
import useEditCoursePage from "../hooks/useEditCoursePage";
import "../styles/edit-course-page.css";

export default function EditCoursePage() {
  const {
    courseId,
    form,
    loading,
    saving,
    deleting,
    toast,
    shortDescriptionCount,
    setToast,
    handleChange,
    handleSubmit,
    handleDelete,
    navigate,
  } = useEditCoursePage();

  if (loading || !form) {
    return (
      <div className="edit-course-page">
        <div className="edit-course-page__loading-card">
          <h1 className="edit-course-page__loading-title">Loading course...</h1>
          <p className="edit-course-page__loading-text">
            Please wait while we fetch the course information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-course-page">
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <EditCourseHero courseId={courseId} />

      <CourseEditorForm
        form={form}
        shortDescriptionCount={shortDescriptionCount}
        pageClass="edit-course-page"
        submitLabel="Save Changes"
        submitLoadingLabel="Saving..."
        submitting={saving}
        deleting={deleting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/instructor/courses")}
        onDelete={handleDelete}
      />
    </div>
  );
}