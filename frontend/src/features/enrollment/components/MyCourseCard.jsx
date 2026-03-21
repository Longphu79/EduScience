import React from "react";
import { Link } from "react-router-dom";
import {
  getSafeImage,
  normalizeCourseProgressItem,
} from "../utils/enrollment.helpers";

export default function MyCourseCard({ item, pageClassName = "" }) {
  const data = normalizeCourseProgressItem(item);
console.log("MyCourseCard item:", item);
console.log("MyCourseCard data:", data);
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

      <div className={`${pageClassName}__course-body`}>
        <h2 className={`${pageClassName}__course-title`}>{data.__title}</h2>

        <p className={`${pageClassName}__course-text`}>{data.__description}</p>

        <div className={`${pageClassName}__progress-box`}>
          <div className={`${pageClassName}__progress-head`}>
            <span>Tiến độ</span>
            <span>{data.__progress}%</span>
          </div>

          <div className={`${pageClassName}__progress-bar`}>
            <div
              className={`${pageClassName}__progress-fill`}
              style={{ width: `${data.__progress}%` }}
            />
          </div>
        </div>

        <div className={`${pageClassName}__course-actions`}>
          <Link
            to={data.__courseId ? `/learn/${data.__courseId}` : "/my-courses"}
            className={`${pageClassName}__link-btn ${pageClassName}__link-btn--blue`}
          >
            Tiếp tục học
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
    </div>
  );
}