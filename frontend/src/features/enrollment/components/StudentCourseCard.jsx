import { Link } from "react-router-dom";
import {
  getSafeImage,
  normalizeCourseProgressItem,
} from "../utils/enrollment.helpers";

export default function StudentCourseCard({ course, pageClassName = "" }) {
  const data = normalizeCourseProgressItem(course);

  return (
    <div className={`${pageClassName}__course-card`}>
      <img
        src={
          getSafeImage(data.__thumbnail) ||
          "https://placehold.co/600x350?text=Course"
        }
        alt={data.__title}
        className={`${pageClassName}__course-thumb`}
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/600x350?text=Course";
        }}
      />

      <h3 className={`${pageClassName}__course-title`}>{data.__title}</h3>

      <p className={`${pageClassName}__course-text`}>{data.__description}</p>

      <div className={`${pageClassName}__progress-box`}>
        <div className={`${pageClassName}__progress-head`}>
          <span>Progress</span>
          <span>{data.__progress}%</span>
        </div>

        <div className={`${pageClassName}__progress-bar`}>
          <div
            className={`${pageClassName}__progress-fill`}
            style={{ width: `${data.__progress}%` }}
          />
        </div>
      </div>

      <div className={`${pageClassName}__mini-grid`}>
        <div className={`${pageClassName}__mini-card`}>
          <div className={`${pageClassName}__mini-label`}>Lessons</div>
          <div className={`${pageClassName}__mini-value`}>
            {data.__completedLessons}/{data.__totalLessons}
          </div>
        </div>

        <div className={`${pageClassName}__mini-card`}>
          <div className={`${pageClassName}__mini-label`}>Status</div>
          <div className={`${pageClassName}__mini-value`}>
            {data.__completed ? "Completed" : "In progress"}
          </div>
        </div>
      </div>

      <div className={`${pageClassName}__course-actions`}>
        <Link
          to={data.__courseId ? `/learn/${data.__courseId}` : "/my-courses"}
          className={`${pageClassName}__link-btn ${pageClassName}__link-btn--dark`}
        >
          Continue
        </Link>

        {data.__completed && data.__courseId ? (
          <Link
            to={`/learn/${data.__courseId}/certificate`}
            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--emerald`}
          >
            Certificate
          </Link>
        ) : null}
      </div>
    </div>
  );
}