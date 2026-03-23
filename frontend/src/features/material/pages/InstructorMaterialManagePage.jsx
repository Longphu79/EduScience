import React from "react";
import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import MaterialForm from "../components/MaterialForm";
import MaterialList from "../components/MaterialList";
import MaterialStats from "../components/MaterialStats";
import useInstructorMaterialManagePage from "../hooks/useInstructorMaterialManagePage";
import "../styles/instructor-material-manage-page.css";

export default function InstructorMaterialManagePage() {
  const pageClassName = "instructor-material-manage-page";

  const {
    courseId,
    course,
    lessons,
    materials,
    loading,
    saving,
    uploading,
    deletingId,
    editingMaterialId,
    selectedFile,
    form,
    toast,
    setToast,
    stats,
    getLessonTitle,
    handleChange,
    handleFileChange,
    handleEdit,
    handleSubmit,
    handleDelete,
    resetForm,
  } = useInstructorMaterialManagePage();

  if (loading) {
    return (
      <div className={pageClassName}>
        <div className={`${pageClassName}__loading-card`}>
          <h1 className={`${pageClassName}__loading-title`}>
            Loading materials...
          </h1>
          <p className={`${pageClassName}__loading-text`}>
            Please wait while we fetch course materials.
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

      <section className={`${pageClassName}__hero`}>
        <div className={`${pageClassName}__hero-row`}>
          <div>
            <p className={`${pageClassName}__eyebrow`}>Instructor Dashboard</p>
            <h1 className={`${pageClassName}__title`}>Manage Materials</h1>
            <p className={`${pageClassName}__subtitle`}>
              Course:{" "}
              <span className={`${pageClassName}__course-name`}>
                {course?.title || "Unknown course"}
              </span>
            </p>
          </div>

          <div className={`${pageClassName}__hero-actions`}>
            <HeaderLink to="/instructor/courses">Back to Courses</HeaderLink>
            <HeaderLink to={`/instructor/courses/${courseId}/lessons`}>
              Manage Lessons
            </HeaderLink>
            <HeaderLink to={`/instructor/courses/${courseId}/quizzes`}>
              Manage Quizzes
            </HeaderLink>
            <HeaderLink to={`/instructor/courses/${courseId}/assignments`}>
              Manage Assignments
            </HeaderLink>
          </div>
        </div>
      </section>

      <MaterialStats {...stats} />

      <div className={`${pageClassName}__content`}>
        <div className={`${pageClassName}__left`}>
          <MaterialForm
            form={form}
            lessons={lessons}
            editingMaterialId={editingMaterialId}
            saving={saving}
            uploading={uploading}
            selectedFile={selectedFile}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
        </div>

        <div className={`${pageClassName}__right`}>
          <MaterialList
            materials={materials}
            getLessonTitle={getLessonTitle}
            showActions
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            emptyTitle="Chưa có tài liệu nào"
            emptyDescription="Hãy tạo tài liệu đầu tiên cho khóa học này."
          />
        </div>
      </div>
    </div>
  );
}

function HeaderLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}