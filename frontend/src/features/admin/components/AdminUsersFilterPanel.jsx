function FilterChip({ label, onRemove }) {
  return (
    <div className="admin-users-filter-chip">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="admin-users-filter-chip__remove"
      >
        ✕
      </button>
    </div>
  );
}

export default function AdminUsersFilterPanel({
  search = "",
  role = "",
  isActive = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  hasActiveFilters = false,
  onChangeSearch,
  onChangeRole,
  onChangeIsActive,
  onChangeSortBy,
  onChangeSortOrder,
  onClearAll,
}) {
  return (
    <section className="admin-users-filter-panel">
      <div className="admin-users-filter-grid">
        <div className="admin-users-filter-field admin-users-filter-field--search">
          <label className="admin-users-filter-label">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => onChangeSearch?.(e.target.value)}
            placeholder="Search username, full name, email..."
            className="admin-users-input"
          />
        </div>

        <div className="admin-users-filter-field">
          <label className="admin-users-filter-label">Role</label>
          <select
            value={role}
            onChange={(e) => onChangeRole?.(e.target.value)}
            className="admin-users-select"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="admin-users-filter-field">
          <label className="admin-users-filter-label">Status</label>
          <select
            value={isActive}
            onChange={(e) => onChangeIsActive?.(e.target.value)}
            className="admin-users-select"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="admin-users-filter-field">
          <label className="admin-users-filter-label">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy?.(e.target.value)}
            className="admin-users-select"
          >
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
            <option value="username">Username</option>
            <option value="fullName">Full Name</option>
            <option value="role">Role</option>
          </select>
        </div>

        <div className="admin-users-filter-field">
          <label className="admin-users-filter-label">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => onChangeSortOrder?.(e.target.value)}
            className="admin-users-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="admin-users-filter-chip-row">
          {search ? (
            <FilterChip label={`Search: ${search}`} onRemove={() => onChangeSearch?.("")} />
          ) : null}

          {role ? (
            <FilterChip label={`Role: ${role}`} onRemove={() => onChangeRole?.("")} />
          ) : null}

          {isActive ? (
            <FilterChip
              label={`Status: ${isActive === "true" ? "Active" : "Inactive"}`}
              onRemove={() => onChangeIsActive?.("")}
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
            className="admin-users-clear-btn"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </section>
  );
}