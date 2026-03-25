import React from "react";
import {
  formatLessonDuration,
  getLessonId,
} from "../utils/enrollment.helpers";

export default function LessonSidebar({
  lessons = [],
  currentLesson,
  completedLessonIds = [],
  onSelectLesson,
  pageClassName = "",
}) {
  const currentLessonId = String(getLessonId(currentLesson));
  const completedSet = new Set(
    (Array.isArray(completedLessonIds) ? completedLessonIds : []).map(String)
  );

  if (!lessons.length) {
    return (
      <aside className={`${pageClassName}__sidebar`}>
        <div className={`${pageClassName}__sidebar-head`}>
          <div className={`${pageClassName}__sidebar-title`}>
            Lộ trình bài học
          </div>
          <div className={`${pageClassName}__sidebar-text`}>
            Chưa có bài học nào trong khóa học này.
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${pageClassName}__sidebar`}>
      <div className={`${pageClassName}__sidebar-head`}>
        <div className={`${pageClassName}__sidebar-title`}>Lộ trình bài học</div>
        <div className={`${pageClassName}__sidebar-text`}>
          Chọn bài học để xem nội dung và tiếp tục học.
        </div>
      </div>

      <div className={`${pageClassName}__sidebar-list`}>
        {lessons.map((lesson, index) => {
          const lessonId = String(getLessonId(lesson));
          const isActive = lessonId === currentLessonId;
          const isCompleted = completedSet.has(lessonId);

          return (
            <button
              key={lessonId || index}
              type="button"
              onClick={() => onSelectLesson?.(lesson)}
              className={`${pageClassName}__sidebar-item ${
                isActive ? `${pageClassName}__sidebar-item--active` : ""
              }`}
            >
              <div className={`${pageClassName}__sidebar-item-row`}>
                <div className={`${pageClassName}__sidebar-item-main`}>
                  <p className={`${pageClassName}__sidebar-item-index`}>
                    Bài {index + 1}
                  </p>
                  <p className={`${pageClassName}__sidebar-item-title`}>
                    {lesson?.title || "Bài học"}
                  </p>
                  <p className={`${pageClassName}__sidebar-item-time`}>
                    {formatLessonDuration(lesson)}
                  </p>
                </div>

                {isCompleted ? (
                  <span
                    className={`${pageClassName}__sidebar-item-badge ${pageClassName}__sidebar-item-badge--done`}
                  >
                    Xong
                  </span>
                ) : isActive ? (
                  <span
                    className={`${pageClassName}__sidebar-item-badge ${pageClassName}__sidebar-item-badge--active`}
                  >
                    Đang học
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}