import { Link } from "react-router-dom";
import ReviewList from "../../review/components/ReviewList";
import ReviewForm from "../../review/components/ReviewForm";
import MaterialList from "../../material/components/MaterialList";
import { getCourseId } from "../utils/course.helpers";

export default function CourseDetailMainContent({
  courseId,
  course,
  lessons,
  reviews,
  materials,
  relatedCourses,
  extraLoading,
  isEnrolled,
  isOwner,
  instructorName,
  instructorAvatar,
  previewVideoUrl,
  onCreateReview,
}) {
  return (
    <div className="course-detail-page__main-content">
      <div className="course-detail-page__meta">
        <span className="course-detail-page__meta-chip">
          {course.category || "General"}
        </span>
        <span className="course-detail-page__meta-chip">
          {course.level
            ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
            : "Beginner"}
        </span>
        <span className="course-detail-page__meta-chip">
          {course.language || "N/A"}
        </span>
        <span className="course-detail-page__meta-chip">
          {lessons.length} lessons
        </span>
        <span className="course-detail-page__meta-chip">
          {course.isFree || Number(course.price || 0) === 0 ? "Free" : "Paid"}
        </span>
        {course?.isPopular ? (
          <span className="course-detail-page__meta-chip">Popular</span>
        ) : null}
      </div>

      <h1 className="course-detail-page__title">{course.title}</h1>
      <p className="course-detail-page__description">
        {course.description || course.shortDescription}
      </p>

      <div className="course-detail-page__extra-grid">
        <div className="course-detail-page__extra-card">
          <span>Duration</span>
          <strong>{course.duration || 0} minutes</strong>
        </div>
        <div className="course-detail-page__extra-card">
          <span>Students</span>
          <strong>{course.totalEnrollments || 0}</strong>
        </div>
        <div className="course-detail-page__extra-card">
          <span>Rating</span>
          <strong>{course.rating || 0} / 5</strong>
        </div>
        <div className="course-detail-page__extra-card">
          <span>Reviews</span>
          <strong>{course.totalReviews || reviews.length || 0}</strong>
        </div>
      </div>

      <div className="course-detail-page__section">
        <h2>Curriculum</h2>

        {lessons.length > 0 ? (
          <div className="course-detail-page__curriculum">
            {lessons.map((lesson, index) => (
              <div
                key={lesson._id || index}
                className="course-detail-page__lesson-item"
              >
                <strong>
                  {index + 1}. {lesson.title || `Lesson ${index + 1}`}
                </strong>
                <span>{lesson.duration || 0} min</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="course-detail-page__curriculum-empty">
            <p>No lesson details yet.</p>
            <p>
              This course currently has{" "}
              <strong>{course.totalLessons || 0}</strong> lesson(s).
            </p>
          </div>
        )}
      </div>

      <div className="course-detail-page__section">
        <h2>Materials</h2>
        {extraLoading ? (
          <p>Loading materials...</p>
        ) : materials.length > 0 ? (
          <MaterialList materials={materials} />
        ) : (
          <p>No materials available yet.</p>
        )}
      </div>

      <div className="course-detail-page__section">
        <h2>Instructor</h2>
        <div className="course-detail-page__instructor-box">
          <img
            src={instructorAvatar}
            alt={instructorName}
            className="course-detail-page__instructor-avatar course-detail-page__instructor-avatar--large"
          />
          <div>
            <h3 className="course-detail-page__instructor-name">
              {instructorName}
            </h3>
            <p className="course-detail-page__instructor-bio">
              This instructor is teaching the course and guiding students
              through practical learning content.
            </p>
          </div>
        </div>
      </div>

      {previewVideoUrl ? (
        <div className="course-detail-page__section">
          <h2>Preview Video</h2>
          <div className="course-detail-page__preview-video">
            <iframe title="course-preview" src={previewVideoUrl} allowFullScreen />
          </div>
        </div>
      ) : null}

      <div className="course-detail-page__section">
        <h2>Reviews</h2>

        {isEnrolled && !isOwner ? (
          <div className="course-detail-page__review-form-wrap">
            <ReviewForm courseId={courseId} onSubmit={onCreateReview} />
          </div>
        ) : (
          <p className="course-detail-page__review-note">
            Enroll this course to write a review.
          </p>
        )}

        {extraLoading ? <p>Loading reviews...</p> : <ReviewList reviews={reviews} />}
      </div>

      {relatedCourses.length > 0 ? (
        <div className="course-detail-page__section">
          <h2>Related Courses</h2>
          <div className="course-detail-page__related-grid">
            {relatedCourses.map((item) => (
              <Link
                key={getCourseId(item)}
                to={`/courses/${getCourseId(item)}`}
                className="course-detail-page__related-card"
              >
                <div className="course-detail-page__related-category">
                  {item.category || "General"}
                </div>
                <div className="course-detail-page__related-title">
                  {item.title}
                </div>
                <div className="course-detail-page__related-text">
                  {item.shortDescription || item.description}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}