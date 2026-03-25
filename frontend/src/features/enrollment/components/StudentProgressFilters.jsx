import React from "react";

export default function StudentProgressFilters({
  search,
  sortBy,
  onSearchChange,
  onSortChange,
  pageClassName = "",
}) {
  return (
    <section className={`${pageClassName}__filter-panel`}>
      <div className={`${pageClassName}__filter-grid`}>
        <div>
          <label className={`${pageClassName}__label`}>
            Tìm kiếm học viên
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className={`${pageClassName}__input`}
          />
        </div>

        <div>
          <label className={`${pageClassName}__label`}>Sắp xếp</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={`${pageClassName}__input`}
          >
            <option value="progress">Sort by progress</option>
            <option value="name">Sort by name</option>
            <option value="latest">Sort by latest enrolled</option>
            <option value="status">Sort by status</option>
          </select>
        </div>
      </div>
    </section>
  );
}