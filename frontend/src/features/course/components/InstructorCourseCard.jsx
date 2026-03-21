import { Link } from "react-router-dom";
import {
  getCourseId,
  getFallbackCourseImage,
  getSafeImage,
} from "../utils/course.helpers";

export default function InstructorCourseCard({
  course,
  deletingId,
  onDelete,
  getStatusMeta,
}) {
  const courseId = getCourseId(course);
  const statusMeta = getStatusMeta(course);

  return (
    <div className={`instructor-courses-page__course-card ${statusMeta.cardTone}`}>
      <div className="instructor-courses-page__course-media">
        <img
          src={getSafeImage(course.thumbnail) || getFallbackCourseImage()}
          alt={course.title}
          className="instructor-courses-page__course-image"
          onError={(e) => {
            e.currentTarget.src = getFallbackCourseImage();
          }}
        />

        <div className="instructor-courses-page__course-badges">
          <span className="instructor-courses-page__category-badge">
            {course.category || "General"}
          </span>

          <span className={statusMeta.badgeClass}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="instructor-courses-page__course-body">
        <h3 className="instructor-courses-page__course-title">
          {course.title}
        </h3>

        <p className="instructor-courses-page__course-description">
          {course.shortDescription || course.description}
        </p>

        <div className="instructor-courses-page__summary-grid">
          <div>
            <div className="instructor-courses-page__summary-label">Lessons</div>
            <div className="instructor-courses-page__summary-value">
              {course.analytics?.totalLessons || 0}
            </div>
          </div>

          <div>
            <div className="instructor-courses-page__summary-label">Duration</div>
            <div className="instructor-courses-page__summary-value">
              {course.duration || 0}m
            </div>
          </div>

          <div>
            <div className="instructor-courses-page__summary-label">Students</div>
            <div className="instructor-courses-page__summary-value">
              {course.analytics?.totalStudents || 0}
            </div>
          </div>
        </div>

        <div className="instructor-courses-page__actions-grid">
          <Link to={`/courses/${courseId}`} className="instructor-courses-page__primary-link">
            View Detail
          </Link>

          <Link to={`/instructor/courses/${courseId}/edit`} className="instructor-courses-page__ghost-link-btn">
            Edit
          </Link>

          <Link to={`/instructor/courses/${courseId}/lessons`} className="instructor-courses-page__ghost-link-btn">
            Lessons
          </Link>

          <Link to={`/instructor/courses/${courseId}/materials`} className="instructor-courses-page__ghost-link-btn">
            Materials
          </Link>

          <Link to={`/instructor/courses/${courseId}/chat`} className="instructor-courses-page__ghost-link-btn">
            Chat
          </Link>

          <button
            type="button"
            onClick={() => onDelete(courseId, course.title)}
            disabled={deletingId === courseId}
            className="instructor-courses-page__delete-btn"
          >
            {deletingId === courseId ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}