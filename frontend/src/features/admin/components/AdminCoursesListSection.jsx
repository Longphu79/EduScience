import { Link } from "react-router-dom";
import {
  FALLBACK_COURSE_IMAGE,
  formatAdminNumber,
  getAdminCourseStatusMeta,
  getAdminSafeImage,
} from "../utils/admin.helpers";

function MiniMetric({ label, value, tone = "slate" }) {
  return (
    <div
      className={`admin-courses-mini-metric admin-courses-mini-metric--${tone}`}
    >
      <div className="admin-courses-mini-metric__label">{label}</div>
      <div className="admin-courses-mini-metric__value">{value}</div>
    </div>
  );
}

export default function AdminCoursesListSection({
  loading = false,
  items = [],
  pagination = null,
  page = 1,
  processingId = "",
  onChangePage,
  onOpenStatusDialog,
}) {
  return (
    <section className="admin-courses-list-panel">
      <div className="admin-courses-list-panel__header">
        <h2 className="admin-courses-list-panel__title">Course List</h2>
        <p className="admin-courses-list-panel__subtitle">
          {pagination
            ? `${formatAdminNumber(pagination.totalItems)} courses found`
            : "Manage all platform courses"}
        </p>
      </div>

      {loading ? (
        <div className="admin-courses-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="admin-courses-skeleton-card">
              <div className="admin-courses-skeleton-card__image" />
              <div className="admin-courses-skeleton-card__body">
                <div className="admin-courses-skeleton admin-courses-skeleton--sm" />
                <div className="admin-courses-skeleton admin-courses-skeleton--lg" />
                <div className="admin-courses-skeleton admin-courses-skeleton--md" />
              </div>
            </div>
          ))}
        </div>
      ) : !items.length ? (
        <div className="admin-courses-empty-state">
          <h3 className="admin-courses-empty-state__title">No courses found</h3>
          <p className="admin-courses-empty-state__subtitle">
            Try adjusting your filters or search keyword.
          </p>
        </div>
      ) : (
        <div className="admin-courses-grid">
          {items.map((course) => {
            const statusMeta = getAdminCourseStatusMeta(course.status);

            return (
              <div
                key={course._id}
                className={`admin-courses-card ${statusMeta.cardTone}`}
              >
                <div className="admin-courses-card__image-wrap">
                  <img
                    src={getAdminSafeImage(course.thumbnail)}
                    alt={course.title}
                    className="admin-courses-card__image"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_COURSE_IMAGE;
                    }}
                  />

                  <div className="admin-courses-card__badges">
                    <span className="admin-courses-chip">
                      {course.category || "General"}
                    </span>

                    <span className={statusMeta.badgeClass}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                <div className="admin-courses-card__body">
                  <h3 className="admin-courses-card__title">{course.title}</h3>

                  <p className="admin-courses-card__instructor">
                    Instructor:{" "}
                    <span>
                      {course.instructorId?.fullName ||
                        course.instructorId?.username ||
                        "Unknown"}
                    </span>
                  </p>

                  <p className="admin-courses-card__description">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="admin-courses-card__metrics">
                    <MiniMetric
                      label="Price"
                      value={
                        course.isFree
                          ? "Free"
                          : `${formatAdminNumber(
                              course.salePrice ?? course.price
                            )} đ`
                      }
                      tone={course.isFree ? "emerald" : "amber"}
                    />
                    <MiniMetric
                      label="Enrollments"
                      value={formatAdminNumber(course.totalEnrollments)}
                      tone="indigo"
                    />
                    <MiniMetric
                      label="Rating"
                      value={`${course.rating || 0}/5`}
                    />
                    <MiniMetric
                      label="Lessons"
                      value={formatAdminNumber(course.totalLessons)}
                    />
                  </div>

                  <div className="admin-courses-card__actions">
                    <Link
                      to={`/courses/${course._id}`}
                      className="admin-courses-primary-btn"
                    >
                      Public View
                    </Link>

                    <Link
                      to={`/admin/courses/${course._id}`}
                      className="admin-courses-ghost-btn"
                    >
                      Admin Detail
                    </Link>

                    <button
                      type="button"
                      onClick={() => onOpenStatusDialog?.(course, "published")}
                      disabled={processingId === course._id}
                      className="admin-courses-action-btn admin-courses-action-btn--emerald"
                    >
                      Publish
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenStatusDialog?.(course, "draft")}
                      disabled={processingId === course._id}
                      className="admin-courses-action-btn admin-courses-action-btn--amber"
                    >
                      Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenStatusDialog?.(course, "archived")}
                      disabled={processingId === course._id}
                      className="admin-courses-action-btn admin-courses-action-btn--slate admin-courses-action-btn--full"
                    >
                      {processingId === course._id ? "Processing..." : "Archive"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="admin-courses-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onChangePage?.(page - 1)}
            className="admin-courses-pagination__btn"
          >
            Previous
          </button>

          <div className="admin-courses-pagination__info">
            Page {page} / {pagination.totalPages}
          </div>

          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => onChangePage?.(page + 1)}
            className="admin-courses-pagination__btn"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}