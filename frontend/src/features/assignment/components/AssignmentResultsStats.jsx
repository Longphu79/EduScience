export default function AssignmentResultsStats({ summary }) {
  return (
    <div className="instructor-assignment-results-page__stats-grid">
      <div className="instructor-assignment-results-page__stat-card">
        <div className="instructor-assignment-results-page__stat-label">
          Total submissions
        </div>
        <div className="instructor-assignment-results-page__stat-value">
          {summary.totalSubmissions}
        </div>
      </div>

      <div className="instructor-assignment-results-page__stat-card">
        <div className="instructor-assignment-results-page__stat-label">
          Graded
        </div>
        <div className="instructor-assignment-results-page__stat-value">
          {summary.gradedCount}
        </div>
      </div>

      <div className="instructor-assignment-results-page__stat-card">
        <div className="instructor-assignment-results-page__stat-label">
          Overdue
        </div>
        <div className="instructor-assignment-results-page__stat-value">
          {summary.overdueCount}
        </div>
      </div>

      <div className="instructor-assignment-results-page__stat-card">
        <div className="instructor-assignment-results-page__stat-label">
          Average grade
        </div>
        <div className="instructor-assignment-results-page__stat-value">
          {summary.averageGrade}
        </div>
      </div>
    </div>
  );
}