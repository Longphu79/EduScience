function FilterChip({ label, onRemove }) {
  return (
    <div className="admin-courses-filter-chip">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="admin-courses-filter-chip__remove"
      >
        ✕
      </button>
    </div>
  );
}

export default function AdminCoursesFilterPanel({
  search = "",
  status = "",
  level = "",
  pricing = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  hasActiveFilters = false,
  onChangeSearch,
  onChangeStatus,
  onChangeLevel,
  onChangePricing,
  onChangeSortBy,
  onChangeSortOrder,
  onClearAll,
}) {
  return (
    <section className="admin-courses-filter-panel">
      <div className="admin-courses-filter-grid">
        <div className="admin-courses-filter-field admin-courses-filter-field--search">
          <label className="admin-courses-filter-label">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => onChangeSearch?.(e.target.value)}
            placeholder="Search title, slug, category..."
            className="admin-courses-input"
          />
        </div>

        <div className="admin-courses-filter-field">
          <label className="admin-courses-filter-label">Status</label>
          <select
            value={status}
            onChange={(e) => onChangeStatus?.(e.target.value)}
            className="admin-courses-select"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="admin-courses-filter-field">
          <label className="admin-courses-filter-label">Level</label>
          <select
            value={level}
            onChange={(e) => onChangeLevel?.(e.target.value)}
            className="admin-courses-select"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="admin-courses-filter-field">
          <label className="admin-courses-filter-label">Pricing</label>
          <select
            value={pricing}
            onChange={(e) => onChangePricing?.(e.target.value)}
            className="admin-courses-select"
          >
            <option value="">All Pricing</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="admin-courses-filter-field">
          <label className="admin-courses-filter-label">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy?.(e.target.value)}
            className="admin-courses-select"
          >
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="totalEnrollments">Enrollments</option>
          </select>
        </div>
      </div>

      <div className="admin-courses-filter-grid admin-courses-filter-grid--second">
        <div className="admin-courses-filter-field admin-courses-filter-field--order">
          <label className="admin-courses-filter-label">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => onChangeSortOrder?.(e.target.value)}
            className="admin-courses-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="admin-courses-filter-chip-row">
          {search ? (
            <FilterChip label={`Search: ${search}`} onRemove={() => onChangeSearch?.("")} />
          ) : null}

          {status ? (
            <FilterChip label={`Status: ${status}`} onRemove={() => onChangeStatus?.("")} />
          ) : null}

          {level ? (
            <FilterChip label={`Level: ${level}`} onRemove={() => onChangeLevel?.("")} />
          ) : null}

          {pricing ? (
            <FilterChip
              label={`Pricing: ${pricing}`}
              onRemove={() => onChangePricing?.("")}
            />
          ) : null}

          {sortBy !== "createdAt" ? (
            <FilterChip
              label={`Sort: ${sortBy}`}
              onRemove={() => onChangeSortBy?.("createdAt")}
            />
          ) : null}

          {sortOrder !== "desc" ? (
            <FilterChip
              label={`Order: ${sortOrder}`}
              onRemove={() => onChangeSortOrder?.("desc")}
            />
          ) : null}

          <button
            type="button"
            onClick={onClearAll}
            className="admin-courses-clear-btn"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </section>
  );
}