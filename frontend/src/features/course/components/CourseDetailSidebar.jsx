import { Link } from "react-router-dom";
import Button from "../../../shared/components/Button";

export default function CourseDetailSidebar({
  course,
  lessons,
  instructorName,
  instructorAvatar,
  displayLevel,
  displayPrice,
  originalPrice,
  isOwner,
  isEnrolled,
  isInCart,
  enrolling,
  addingToCart,
  primaryButtonText,
  onPrimaryAction,
}) {
  return (
    <aside className="course-detail-page__sidebar">
      <div className="course-detail-page__instructor-card">
        <div className="course-detail-page__instructor-row">
          <img
            src={instructorAvatar}
            alt={instructorName}
            className="course-detail-page__instructor-avatar"
          />
          <div>
            <p className="course-detail-page__sidebar-label">Course Instructor</p>
            <div className="course-detail-page__instructor-name">
              {instructorName}
            </div>
          </div>
        </div>

        <div className="course-detail-page__price-box">
          <div className="course-detail-page__price-row">
            <span>Current price</span>
            <strong className="course-detail-page__price-main">
              {displayPrice}
            </strong>
          </div>

          {originalPrice ? (
            <div className="course-detail-page__price-row">
              <span>Original price</span>
              <span className="course-detail-page__old-price">
                {originalPrice}
              </span>
            </div>
          ) : null}

          <div className="course-detail-page__price-row">
            <span>Level</span>
            <span>{displayLevel}</span>
          </div>

          <div className="course-detail-page__price-row">
            <span>Category</span>
            <span>{course.category || "General"}</span>
          </div>

          <div className="course-detail-page__price-row">
            <span>Language</span>
            <span>{course.language || "N/A"}</span>
          </div>

          <div className="course-detail-page__price-row">
            <span>Duration</span>
            <span>{course.duration || 0} min</span>
          </div>

          <div className="course-detail-page__price-row">
            <span>Lessons</span>
            <span>{lessons.length}</span>
          </div>

          <div className="course-detail-page__price-row">
            <span>Students</span>
            <span>{course.totalEnrollments || 0}</span>
          </div>
        </div>

        <div className="course-detail-page__primary-action-wrap">
          <Button
            onClick={onPrimaryAction}
            loading={enrolling || addingToCart}
            disabled={isOwner}
            className="full-btn"
          >
            {primaryButtonText}
          </Button>
        </div>

        <div className="course-detail-page__sidebar-actions">
          <Link
            to="/courses"
            className="course-detail-page__link-btn course-detail-page__link-btn--secondary"
          >
            Back to Courses
          </Link>

          <Link
            to="/my-courses"
            className="course-detail-page__link-btn course-detail-page__link-btn--secondary"
          >
            My Courses
          </Link>

          {isEnrolled ? (
            <Link
              to={`/learn/${course._id}`}
              className="course-detail-page__link-btn"
            >
              Continue Learning
            </Link>
          ) : null}

          {isInCart && !isEnrolled ? (
            <Link
              to="/cart"
              className="course-detail-page__link-btn course-detail-page__link-btn--secondary"
            >
              Open Cart
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}