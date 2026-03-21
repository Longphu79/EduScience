import { Link } from "react-router-dom";
import {
  formatPriceVND,
  getCoursePublishState,
  getSafeCourseId,
  getSafeImage,
} from "../utils/enrollment.helpers";

export default function CourseWideCard({ course, pageClassName = "" }) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

  const imageSrc = getSafeImage(course?.thumbnail) || fallbackImage;
  const publishMeta = getCoursePublishState(course);
  const courseId = getSafeCourseId(course);

  const displayPrice =
    course?.isFree || Number(course?.price || 0) === 0
      ? "Free"
      : formatPriceVND(course?.salePrice || course?.price || 0);

  return (
    <div className={`${pageClassName}__course-card`}>
      <div className={`${pageClassName}__course-grid`}>
        <div className={`${pageClassName}__course-media`}>
          <img
            src={imageSrc}
            alt={course?.title || "Course"}
            className={`${pageClassName}__course-image`}
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />

          <div className={`${pageClassName}__course-overlay`} />

          <div className={`${pageClassName}__course-badges`}>
            <span className={`${pageClassName}__pill ${pageClassName}__pill--white`}>
              {course?.category || "General"}
            </span>

            <span className={`${pageClassName}__pill ${publishMeta.className}`}>
              {publishMeta.label}
            </span>
          </div>
        </div>

        <div className={`${pageClassName}__course-content`}>
          <div className={`${pageClassName}__course-content-inner`}>
            <div>
              <h3 className={`${pageClassName}__course-title`}>
                {course?.title || "Course"}
              </h3>

              <p className={`${pageClassName}__course-text`}>
                {course?.shortDescription ||
                  course?.description ||
                  "No description available."}
              </p>
            </div>

            <div className={`${pageClassName}__course-meta-grid`}>
              <MetaItem
                label="Students"
                value={course?.totalEnrollments || 0}
                pageClassName={pageClassName}
              />
              <MetaItem
                label="Lessons"
                value={course?.totalLessons || 0}
                pageClassName={pageClassName}
              />
              <MetaItem
                label="Price"
                value={displayPrice}
                pageClassName={pageClassName}
              />
              <MetaItem
                label="Duration"
                value={`${course?.duration || 0}m`}
                pageClassName={pageClassName}
              />
            </div>

            <div className={`${pageClassName}__course-actions`}>
              <Link
                to={courseId ? `/instructor/courses/${courseId}/edit` : "/instructor/courses"}
                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--indigo`}
              >
                Edit course
              </Link>

              <Link
                to={courseId ? `/instructor/courses/${courseId}/students` : "/instructor/courses"}
                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
              >
                View students
              </Link>

              <Link
                to={courseId ? `/instructor/courses/${courseId}/quizzes` : "/instructor/courses"}
                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
              >
                Manage quizzes
              </Link>

              <Link
                to={courseId ? `/instructor/courses/${courseId}/assignments` : "/instructor/courses"}
                className={`${pageClassName}__link-btn ${pageClassName}__link-btn--slate`}
              >
                Manage assignments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, pageClassName = "" }) {
  return (
    <div className={`${pageClassName}__mini-card`}>
      <div className={`${pageClassName}__mini-label`}>{label}</div>
      <div className={`${pageClassName}__mini-value`}>{value}</div>
    </div>
  );
}