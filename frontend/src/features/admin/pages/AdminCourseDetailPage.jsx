import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import useAdminCourseDetailPage from "../hooks/useAdminCourseDetailPage";
import { getAdminConfirmVariantByStatus } from "../utils/admin.helpers";
import AdminCourseDetailHero from "../components/AdminCourseDetailHero";
import AdminCourseDetailContent from "../components/AdminCourseDetailContent";
import AdminCourseInstructorSection from "../components/AdminCourseInstructorSection";
import "../styles/admin-course-detail-page.css";

export default function AdminCourseDetailPage() {
  const {
    loading,
    processingStatus,
    toast,
    setToast,
    confirmState,
    course,
    summary,
    statusMeta,
    fetchDetail,
    openStatusDialog,
    closeStatusDialog,
    handleConfirmChangeStatus,
  } = useAdminCourseDetailPage();

  if (loading) {
    return (
      <div className="admin-course-detail-page">
        <div className="admin-course-detail-skeleton admin-course-detail-skeleton--hero" />
        <div className="admin-course-detail-summary-grid">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="admin-course-detail-skeleton admin-course-detail-skeleton--card"
            />
          ))}
        </div>
        <div className="admin-course-detail-skeleton admin-course-detail-skeleton--panel" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="admin-course-detail-page">
        {toast.message ? (
          <Toast
            kind={toast.kind}
            message={toast.message}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <div className="admin-course-detail-not-found">
          <h1 className="admin-course-detail-not-found__title">Course not found</h1>
          <p className="admin-course-detail-not-found__description">
            The requested course detail could not be loaded.
          </p>
          <div className="admin-course-detail-not-found__actions">
            <Link to="/admin/courses" className="admin-course-detail-ghost-btn">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-course-detail-page">
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <AdminCourseDetailHero
        course={course}
        statusMeta={statusMeta}
        processingStatus={processingStatus}
        onRefresh={fetchDetail}
        onOpenStatusDialog={openStatusDialog}
      />

      <AdminCourseDetailContent
        course={course}
        summary={summary}
        statusMeta={statusMeta}
        processingStatus={processingStatus}
        onOpenStatusDialog={openStatusDialog}
      />

      <AdminCourseInstructorSection course={course} />

      <ConfirmDialog
        open={confirmState.open}
        title="Change course status?"
        message={`You are about to move "${course.title}" to "${confirmState.nextStatus}".`}
        confirmText={`Move to ${confirmState.nextStatus || "status"}`}
        confirmVariant={getAdminConfirmVariantByStatus(confirmState.nextStatus)}
        loading={processingStatus}
        onConfirm={handleConfirmChangeStatus}
        onClose={closeStatusDialog}
      />
    </div>
  );
}