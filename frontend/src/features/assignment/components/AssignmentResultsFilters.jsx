export default function AssignmentResultsFilters({
  search,
  statusFilter,
  sortBy,
  onChangeSearch,
  onChangeStatusFilter,
  onChangeSortBy,
}) {
  return (
    <div className="instructor-assignment-results-page__filters">
      <input
        type="text"
        value={search}
        onChange={(event) => onChangeSearch(event.target.value)}
        placeholder="Tìm theo tên hoặc email học viên..."
        className="assignment-form__input"
      />

      <select
        value={statusFilter}
        onChange={(event) => onChangeStatusFilter(event.target.value)}
        className="assignment-form__select"
      >
        <option value="all">All statuses</option>
        <option value="submitted">Submitted</option>
        <option value="resubmitted">Resubmitted</option>
        <option value="graded">Graded</option>
        <option value="overdue">Overdue</option>
      </select>

      <select
        value={sortBy}
        onChange={(event) => onChangeSortBy(event.target.value)}
        className="assignment-form__select"
      >
        <option value="latest">Sort by latest submission</option>
        <option value="grade">Sort by grade</option>
      </select>
    </div>
  );
}