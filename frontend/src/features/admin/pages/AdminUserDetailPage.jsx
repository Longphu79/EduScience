import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import useAdminUserDetailPage from "../hooks/useAdminUserDetailPage";
import AdminUserDetailHero from "../components/AdminUserDetailHero";
import AdminUserDetailContent from "../components/AdminUserDetailContent";
import AdminUserRoleRecordsSection from "../components/AdminUserRoleRecordsSection";
import "../styles/admin-user-detail-page.css";

export default function AdminUserDetailPage() {
  const {
    loading,
    processing,
    toast,
    setToast,
    confirmOpen,
    setConfirmOpen,
    user,
    summary,
    enrollments,
    courses,
    fetchDetail,
    handleConfirmToggleActive,
  } = useAdminUserDetailPage();

  if (loading) {
    return (
      <div className="admin-user-detail-page">
        <div className="admin-user-detail-skeleton admin-user-detail-skeleton--hero" />
        <div className="admin-user-detail-summary-grid">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="admin-user-detail-skeleton admin-user-detail-skeleton--card"
            />
          ))}
        </div>
        <div className="admin-user-detail-skeleton admin-user-detail-skeleton--panel" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-user-detail-page">
        {toast.message ? (
          <Toast
            kind={toast.kind}
            message={toast.message}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <div className="admin-user-detail-not-found">
          <h1 className="admin-user-detail-not-found__title">User not found</h1>
          <p className="admin-user-detail-not-found__description">
            The requested user detail could not be loaded.
          </p>
          <div className="admin-user-detail-not-found__actions">
            <Link to="/admin/users" className="admin-user-detail-ghost-btn">
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-detail-page">
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <AdminUserDetailHero
        user={user}
        processing={processing}
        onRefresh={fetchDetail}
        onOpenConfirm={() => setConfirmOpen(true)}
      />

      <AdminUserDetailContent user={user} summary={summary} />

      <AdminUserRoleRecordsSection
        user={user}
        enrollments={enrollments}
        courses={courses}
        processing={processing}
        onOpenConfirm={() => setConfirmOpen(true)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={user.isActive ? "Deactivate user?" : "Reactivate user?"}
        message={
          user.isActive
            ? `This will disable "${user.fullName || user.username}" from normal platform access.`
            : `This will restore "${user.fullName || user.username}" and allow platform access again.`
        }
        confirmText={user.isActive ? "Deactivate" : "Reactivate"}
        confirmVariant={user.isActive ? "danger" : "success"}
        loading={processing}
        onConfirm={handleConfirmToggleActive}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}