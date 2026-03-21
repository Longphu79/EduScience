import { Link, useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Toast from "../../../shared/components/Toast";
import AssignmentResultsFilters from "../components/AssignmentResultsFilters";
import AssignmentResultsStats from "../components/AssignmentResultsStats";
import GradeModal from "../components/GradeModal";
import SubmissionResultCard from "../components/SubmissionResultCard";
import useInstructorAssignmentResultsPage from "../hooks/useInstructorAssignmentResultsPage";
import "../styles/instructor-assignment-results-page.css";
import "../styles/assignment-components.css";

export default function InstructorAssignmentResultsPage() {
  const { courseId } = useParams();

  const {
    assignment,
    filteredSubmissions,
    loading,
    toast,
    search,
    statusFilter,
    sortBy,
    gradeModalOpen,
    gradeScore,
    gradeFeedback,
    grading,
    summary,
    setToast,
    setSearch,
    setStatusFilter,
    setSortBy,
    setGradeScore,
    setGradeFeedback,
    openGradeModal,
    closeGradeModal,
    handleSaveGrade,
  } = useInstructorAssignmentResultsPage();

  if (loading) {
    return (
      <div className="instructor-assignment-results-page">
        <div className="instructor-assignment-results-page__loading">
          Đang tải assignment results...
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-assignment-results-page">
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <GradeModal
        open={gradeModalOpen}
        submitting={grading}
        score={gradeScore}
        feedback={gradeFeedback}
        maxScore={assignment?.maxScore ?? 100}
        onChangeScore={setGradeScore}
        onChangeFeedback={setGradeFeedback}
        onClose={closeGradeModal}
        onSubmit={handleSaveGrade}
      />

      <div className="instructor-assignment-results-page__hero">
        <div className="instructor-assignment-results-page__hero-layout">
          <div>
            <div className="instructor-assignment-results-page__eyebrow">
              Assignment Results Dashboard
            </div>
            <h1 className="instructor-assignment-results-page__title">
              {assignment?.title || "Assignment Results"}
            </h1>
            <p className="instructor-assignment-results-page__subtitle">
              Theo dõi bài nộp, lọc dữ liệu và chấm điểm assignment.
            </p>
          </div>

          <div>
            <Link to={`/instructor/courses/${courseId}/assignments`}>
              <Button type="button">Back to Assignments</Button>
            </Link>
          </div>
        </div>
      </div>

      <AssignmentResultsStats summary={summary} />

      <AssignmentResultsFilters
        search={search}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onChangeSearch={setSearch}
        onChangeStatusFilter={setStatusFilter}
        onChangeSortBy={setSortBy}
      />

      <div className="instructor-assignment-results-page__list">
        {filteredSubmissions.length === 0 ? (
          <div className="instructor-assignment-results-page__empty">
            Chưa có dữ liệu phù hợp.
          </div>
        ) : (
          filteredSubmissions.map((item) => (
            <SubmissionResultCard
              key={item._id}
              submission={item}
              maxScore={assignment?.maxScore ?? 100}
              onGrade={openGradeModal}
            />
          ))
        )}
      </div>
    </div>
  );
}