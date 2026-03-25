import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import useAdminUsersPage from "../hooks/useAdminUsersPage";
import { formatAdminNumber } from "../utils/admin.helpers";
import AdminPageHero from "../components/AdminPageHero";
import AdminInsightPill from "../components/AdminInsightPill";
import AdminUsersFilterPanel from "../components/AdminUsersFilterPanel";
import AdminUsersListSection from "../components/AdminUsersListSection";
import "../styles/admin-users-page.css";

export default function AdminUsersPage() {
  const {
    loading,
    items,
    pagination,
    processingId,
    toast,
    setToast,
    confirmState,
    page,
    search,
    role,
    isActive,
    sortBy,
    sortOrder,
    counters,
    hasActiveFilters,
    updateQuery,
    clearAllFilters,
    openToggleDialog,
    closeToggleDialog,
    handleConfirmToggleActive,
  } = useAdminUsersPage();

  return (
    <div className="admin-users-page">
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <AdminPageHero
        title="Manage Users"
        description="Search, filter and manage students, instructors and admins."
        actions={
          <Link to="/admin/dashboard" className="admin-users-header-btn">
            Back to Dashboard
          </Link>
        }
      />

      <div className="admin-users-pill-grid">
        <AdminInsightPill
          label="Loaded Users"
          value={formatAdminNumber(counters.total)}
          hint="Users currently loaded on this page"
          tone="slate"
        />
        <AdminInsightPill
          label="Students"
          value={formatAdminNumber(counters.totalStudents)}
          hint="Student accounts in current result"
          tone="emerald"
          to="/admin/users?role=student"
        />
        <AdminInsightPill
          label="Instructors"
          value={formatAdminNumber(counters.totalInstructors)}
          hint="Instructor accounts in current result"
          tone="indigo"
          to="/admin/users?role=instructor"
        />
        <AdminInsightPill
          label="Admins"
          value={formatAdminNumber(counters.totalAdmins)}
          hint="Admin accounts in current result"
          tone="red"
          to="/admin/users?role=admin"
        />
        <AdminInsightPill
          label="Active"
          value={formatAdminNumber(counters.activeUsers)}
          hint="Currently active accounts"
          tone="emerald"
          to="/admin/users?isActive=true"
        />
        <AdminInsightPill
          label="Inactive"
          value={formatAdminNumber(counters.inactiveUsers)}
          hint="Currently inactive accounts"
          tone="amber"
          to="/admin/users?isActive=false"
        />
      </div>

      <AdminUsersFilterPanel
        search={search}
        role={role}
        isActive={isActive}
        sortBy={sortBy}
        sortOrder={sortOrder}
        hasActiveFilters={hasActiveFilters}
        onChangeSearch={(value) => updateQuery({ search: value, page: 1 })}
        onChangeRole={(value) => updateQuery({ role: value, page: 1 })}
        onChangeIsActive={(value) => updateQuery({ isActive: value, page: 1 })}
        onChangeSortBy={(value) => updateQuery({ sortBy: value, page: 1 })}
        onChangeSortOrder={(value) =>
          updateQuery({ sortOrder: value, page: 1 })
        }
        onClearAll={clearAllFilters}
      />

      <AdminUsersListSection
        loading={loading}
        items={items}
        pagination={pagination}
        page={page}
        processingId={processingId}
        onChangePage={(nextPage) => updateQuery({ page: nextPage })}
        onOpenToggleDialog={openToggleDialog}
      />

      <ConfirmDialog
        open={confirmState.open}
        title={
          confirmState.user?.isActive ? "Deactivate user?" : "Reactivate user?"
        }
        message={
          confirmState.user
            ? confirmState.user.isActive
              ? `This will disable "${confirmState.user.fullName || confirmState.user.username}" from normal platform access.`
              : `This will restore "${confirmState.user.fullName || confirmState.user.username}" and allow platform access again.`
            : ""
        }
        confirmText={confirmState.user?.isActive ? "Deactivate" : "Reactivate"}
        confirmVariant={confirmState.user?.isActive ? "danger" : "success"}
        loading={processingId === confirmState.user?._id}
        onConfirm={handleConfirmToggleActive}
        onClose={closeToggleDialog}
      />
    </div>
  );
}