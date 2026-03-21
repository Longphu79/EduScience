import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import useAdminCoursesPage from "../hooks/useAdminCoursesPage";
import {
  formatAdminNumber,
  getAdminConfirmVariantByStatus,
} from "../utils/admin.helpers";
import AdminPageHero from "../components/AdminPageHero";
import AdminInsightPill from "../components/AdminInsightPill";
import AdminCoursesFilterPanel from "../components/AdminCoursesFilterPanel";
import AdminCoursesListSection from "../components/AdminCoursesListSection";
import "../styles/admin-courses-page.css";

export default function AdminCoursesPage() {
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
    status,
    level,
    pricing,
    sortBy,
    sortOrder,
    counters,
    hasActiveFilters,
    updateQuery,
    clearAllFilters,
    openStatusDialog,
    closeStatusDialog,
    handleConfirmChangeStatus,
  } = useAdminCoursesPage();

  return (
    <div className="admin-courses-page">
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <AdminPageHero
        title="Manage Courses"
        description="Review, filter and control course publishing lifecycle."
        actions={
          <Link to="/admin/dashboard" className="admin-courses-header-btn">
            Back to Dashboard
          </Link>
        }
      />

      <div className="admin-courses-pill-grid">
        <AdminInsightPill
          label="Loaded Courses"
          value={formatAdminNumber(counters.total)}
          hint="Courses currently loaded on this page"
          tone="slate"
        />
        <AdminInsightPill
          label="Published"
          value={formatAdminNumber(counters.published)}
          hint="Live courses on current result"
          tone="emerald"
          to="/admin/courses?status=published"
        />
        <AdminInsightPill
          label="Draft"
          value={formatAdminNumber(counters.draft)}
          hint="Courses not published yet"
          tone="amber"
          to="/admin/courses?status=draft"
        />
        <AdminInsightPill
          label="Archived"
          value={formatAdminNumber(counters.archived)}
          hint="Archived courses in current result"
          tone="slate"
          to="/admin/courses?status=archived"
        />
        <AdminInsightPill
          label="Free"
          value={formatAdminNumber(counters.freeCourses)}
          hint="Free learning products"
          tone="indigo"
          to="/admin/courses?pricing=free"
        />
        <AdminInsightPill
          label="Paid"
          value={formatAdminNumber(counters.paidCourses)}
          hint="Monetized courses"
          tone="rose"
          to="/admin/courses?pricing=paid"
        />
      </div>

      <AdminCoursesFilterPanel
        search={search}
        status={status}
        level={level}
        pricing={pricing}
        sortBy={sortBy}
        sortOrder={sortOrder}
        hasActiveFilters={hasActiveFilters}
        onChangeSearch={(value) => updateQuery({ search: value, page: 1 })}
        onChangeStatus={(value) => updateQuery({ status: value, page: 1 })}
        onChangeLevel={(value) => updateQuery({ level: value, page: 1 })}
        onChangePricing={(value) => updateQuery({ pricing: value, page: 1 })}
        onChangeSortBy={(value) => updateQuery({ sortBy: value, page: 1 })}
        onChangeSortOrder={(value) =>
          updateQuery({ sortOrder: value, page: 1 })
        }
        onClearAll={clearAllFilters}
      />

      <AdminCoursesListSection
        loading={loading}
        items={items}
        pagination={pagination}
        page={page}
        processingId={processingId}
        onChangePage={(nextPage) => updateQuery({ page: nextPage })}
        onOpenStatusDialog={openStatusDialog}
      />

      <ConfirmDialog
        open={confirmState.open}
        title="Change course status?"
        message={
          confirmState.courseTitle
            ? `You are about to move "${confirmState.courseTitle}" to "${confirmState.nextStatus}".`
            : ""
        }
        confirmText={`Move to ${confirmState.nextStatus || "status"}`}
        confirmVariant={getAdminConfirmVariantByStatus(confirmState.nextStatus)}
        loading={processingId === confirmState.courseId}
        onConfirm={handleConfirmChangeStatus}
        onClose={closeStatusDialog}
      />
    </div>
  );
}