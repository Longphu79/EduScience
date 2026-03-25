import "../styles/all-courses-page.css";

export default function CoursePagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="course-pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="course-pagination__btn"
      >
        Previous
      </button>

      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`course-pagination__btn ${
            item === page ? "course-pagination__btn--active" : ""
          }`}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="course-pagination__btn"
      >
        Next
      </button>
    </div>
  );
}