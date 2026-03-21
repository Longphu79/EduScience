import { Link } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import {
  FALLBACK_COURSE_IMAGE,
  getAdminSafeImage,
} from "../utils/admin.helpers";

export default function AdminCourseDetailHero({
  course,
  statusMeta,
  processingStatus = false,
  onRefresh,
  onOpenStatusDialog,
}) {
  if (!course) return null;

  return (
    <section className="admin-course-detail-hero">
      <div className="admin-course-detail-hero__media">
        <img
          src={getAdminSafeImage(course.thumbnail)}
          alt={course.title}
          className="admin-course-detail-hero__image"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_COURSE_IMAGE;
          }}
        />

        <div className="admin-course-detail-hero__overlay" />

        <div className="admin-course-detail-hero__badges">
          <span className="admin-course-detail-chip">
            {course.category || "General"}
          </span>
          <span className={statusMeta?.detailBadgeClass}>
            {statusMeta?.label || "Draft"}
          </span>
          <span className="admin-course-detail-chip">{course.level || "N/A"}</span>
          <span className="admin-course-detail-chip">
            {course.isFree ? "Free" : "Paid"}
          </span>
        </div>

        <div className="admin-course-detail-hero__content">
          <div className="admin-course-detail-hero__admin-badge">
            Admin Console
          </div>
          <h1 className="admin-course-detail-hero__title">{course.title}</h1>
          <p className="admin-course-detail-hero__description">
            {course.shortDescription || course.description}
          </p>
        </div>
      </div>

      <div className="admin-course-detail-hero__footer">
        <div className="admin-course-detail-hero__instructor">
          Instructor:{" "}
          <span>
            {course.instructorId?.fullName ||
              course.instructorId?.username ||
              "Unknown"}
          </span>
        </div>

        <div className="admin-course-detail-hero__actions">
          <button
            type="button"
            onClick={onRefresh}
            className="admin-course-detail-ghost-btn admin-course-detail-ghost-btn--icon"
          >
            <RefreshCcw className="admin-course-detail-btn-icon" />
            Refresh
          </button>

          <Link to="/admin/courses" className="admin-course-detail-ghost-btn">
            Back to Courses
          </Link>

          <Link
            to={`/courses/${course._id}`}
            className="admin-course-detail-ghost-btn"
          >
            Public View
          </Link>

          <button
            type="button"
            onClick={() => onOpenStatusDialog?.("published")}
            disabled={processingStatus}
            className="admin-course-detail-action-btn admin-course-detail-action-btn--emerald"
          >
            Publish
          </button>

          <button
            type="button"
            onClick={() => onOpenStatusDialog?.("draft")}
            disabled={processingStatus}
            className="admin-course-detail-action-btn admin-course-detail-action-btn--amber"
          >
            Draft
          </button>

          <button
            type="button"
            onClick={() => onOpenStatusDialog?.("archived")}
            disabled={processingStatus}
            className="admin-course-detail-action-btn admin-course-detail-action-btn--slate"
          >
            {processingStatus ? "Processing..." : "Archive"}
          </button>
        </div>
      </div>
    </section>
  );
}