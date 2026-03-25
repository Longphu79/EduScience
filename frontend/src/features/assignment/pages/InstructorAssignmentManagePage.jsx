import Toast from "../../../shared/components/Toast";
import AssignmentForm from "../components/AssignmentForm";
import AssignmentManageList from "../components/AssignmentManageList";
import useInstructorAssignmentManagePage from "../hooks/useInstructorAssignmentManagePage";
import "../styles/instructor-assignment-manage-page.css";
import "../styles/assignment-components.css";

export default function InstructorAssignmentManagePage() {
  const {
    courseId,
    assignments,
    filteredAssignments,
    form,
    editingId,
    selectedAttachmentFiles,
    keptAttachmentUrls,
    loading,
    saving,
    deletingId,
    search,
    toast,
    setToast,
    setSearch,
    resetForm,
    handleFieldChange,
    handleEdit,
    handleRemoveKeptAttachment,
    handleAddFiles,
    handleRemoveSelectedFile,
    handleSubmit,
    handleDelete,
  } = useInstructorAssignmentManagePage();

  return (
    <div className="instructor-assignment-manage-page">
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <div className="instructor-assignment-manage-page__hero">
        <div className="instructor-assignment-manage-page__hero-layout">
          <div>
            <div className="instructor-assignment-manage-page__eyebrow">
              Instructor Assignment Manager
            </div>
            <h1 className="instructor-assignment-manage-page__title">
              Manage Assignments
            </h1>
            <p className="instructor-assignment-manage-page__subtitle">
              Tạo, chỉnh sửa và quản lý bài tập cho khóa học.
            </p>
          </div>

          <div className="instructor-assignment-manage-page__summary">
            Tổng số assignment:
            <span className="instructor-assignment-manage-page__summary-value">
              {" "}
              {assignments.length}
            </span>
          </div>
        </div>
      </div>

      <AssignmentForm
        form={form}
        editingId={editingId}
        saving={saving}
        keptAttachmentUrls={keptAttachmentUrls}
        selectedAttachmentFiles={selectedAttachmentFiles}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={resetForm}
        onRemoveKeptAttachment={handleRemoveKeptAttachment}
        onAddFiles={handleAddFiles}
        onRemoveSelectedFile={handleRemoveSelectedFile}
      />

      <div className="instructor-assignment-manage-page__search-card">
        <div className="instructor-assignment-manage-page__search-layout">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm assignment theo tên hoặc mô tả..."
            className="assignment-form__input"
          />

          <div className="instructor-assignment-manage-page__search-summary">
            Hiển thị:
            <span className="instructor-assignment-manage-page__search-summary-value">
              {" "}
              {filteredAssignments.length}
            </span>
          </div>
        </div>
      </div>

      <div className="instructor-assignment-manage-page__list-section">
        <h2 className="instructor-assignment-manage-page__section-title">
          Assignment List
        </h2>

        <AssignmentManageList
          items={filteredAssignments}
          courseId={courseId}
          loading={loading}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {!loading && filteredAssignments.length === 0 ? (
          <div className="instructor-assignment-manage-page__empty">
            {assignments.length === 0
              ? "Chưa có assignment nào."
              : "Không tìm thấy assignment phù hợp."}
          </div>
        ) : null}
      </div>
    </div>
  );
}