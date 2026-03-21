import Toast from "../../../shared/components/Toast";
import AssignmentDetailCard from "../components/AssignmentDetailCard";
import AssignmentSidebar from "../components/AssignmentSidebar";
import AssignmentSubmissionSummary from "../components/AssignmentSubmissionSummary";
import AssignmentSubmitCard from "../components/AssignmentSubmitCard";
import useAssignmentPage from "../hooks/useAssignmentPage";
import "../styles/assignment-page.css";
import "../styles/assignment-components.css";

export default function AssignmentPage() {
  const {
    assignments,
    submissionsMap,
    selectedAssignment,
    currentSubmission,
    currentStatusMeta,
    submissionText,
    selectedFiles,
    loading,
    submitting,
    toast,
    canResubmit,
    isSubmitDisabled,
    setToast,
    setSubmissionText,
    setSelectedFiles,
    handleSubmit,
    handleSelectAssignment,
    handleBackToAssignments,
    handleBackToLearnCourse,
  } = useAssignmentPage();

  if (loading) {
    return (
      <div className="assignment-page">
        <div className="assignment-page__loading-card">Đang tải bài tập...</div>
      </div>
    );
  }

  return (
    <div className="assignment-page">
      <Toast
        message={toast.message}
        kind={toast.kind}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div className="assignment-page__hero">
        <div className="assignment-page__hero-layout">
          <div>
            <h1 className="assignment-page__title">Bài tập</h1>
            <p className="assignment-page__subtitle">
              Nộp bài, theo dõi kết quả chấm và nhận feedback từ instructor.
            </p>
          </div>

          <div className="assignment-page__hero-actions">
            <button
              type="button"
              className="assignment-page__ghost-link"
              onClick={handleBackToAssignments}
            >
              Back to Assignments
            </button>

            <button
              type="button"
              className="assignment-page__ghost-link"
              onClick={handleBackToLearnCourse}
            >
              Back to Learn Course
            </button>
          </div>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="assignment-page__empty-card">Chưa có bài tập nào.</div>
      ) : (
        <div className="assignment-page__layout">
          <AssignmentSidebar
            assignments={assignments}
            selectedAssignmentId={selectedAssignment?._id}
            submissionsMap={submissionsMap}
            onSelect={handleSelectAssignment}
          />

          <section className="assignment-page__content">
            {selectedAssignment ? (
              <div className="assignment-page__stack">
                <AssignmentDetailCard assignment={selectedAssignment} />

                <AssignmentSubmissionSummary
                  submission={currentSubmission}
                  assignment={selectedAssignment}
                  statusMeta={currentStatusMeta}
                />

                <AssignmentSubmitCard
                  currentSubmission={currentSubmission}
                  assignment={selectedAssignment}
                  submissionText={submissionText}
                  onChangeSubmissionText={setSubmissionText}
                  selectedFiles={selectedFiles}
                  onChangeFiles={setSelectedFiles}
                  isSubmitDisabled={isSubmitDisabled}
                  submitting={submitting}
                  canResubmit={canResubmit}
                  onSubmit={handleSubmit}
                  onBackToAssignments={handleBackToAssignments}
                  onBackToLearnCourse={handleBackToLearnCourse}
                />
              </div>
            ) : (
              <div className="assignment-page__empty-card">
                No assignment selected.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}