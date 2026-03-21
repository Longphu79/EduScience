import React from "react";
import EnrollmentSectionCard from "./EnrollmentSectionCard";
import { getLessonId } from "../utils/enrollment.helpers";

export default function StudentLessonProgressList({
  lessons = [],
  completedLessonIds = [],
  enrollment,
  pageClassName = "",
}) {
  const completedSet = new Set(
    (Array.isArray(completedLessonIds) ? completedLessonIds : []).map(String)
  );
  const currentLessonId = String(
    getLessonId(enrollment?.lastLessonId || enrollment?.currentLessonId)
  );

  return (
    <EnrollmentSectionCard
      title="Lesson progress"
      description="Danh sách toàn bộ bài học và trạng thái hoàn thành của học viên."
      pageClassName={pageClassName}
    >
      {!lessons.length ? (
        <div className={`${pageClassName}__empty-soft`}>
          Khóa học chưa có bài học.
        </div>
      ) : (
        <div className={`${pageClassName}__lesson-progress-list`}>
          {lessons.map((lesson, index) => {
            const lessonId = String(getLessonId(lesson));
            const isDone = completedSet.has(lessonId);
            const isCurrent = lessonId === currentLessonId;

            return (
              <div
                key={lessonId || index}
                className={`${pageClassName}__lesson-progress-item ${
                  isCurrent ? `${pageClassName}__lesson-progress-item--active` : ""
                }`}
              >
                <div className={`${pageClassName}__lesson-progress-row`}>
                  <div className={`${pageClassName}__lesson-progress-main`}>
                    <div className={`${pageClassName}__lesson-progress-top`}>
                      <span className={`${pageClassName}__chip`}>
                        Lesson {index + 1}
                      </span>

                      {isCurrent ? (
                        <span
                          className={`${pageClassName}__chip ${pageClassName}__chip--indigo`}
                        >
                          Current
                        </span>
                      ) : null}
                    </div>

                    <div className={`${pageClassName}__lesson-progress-title`}>
                      {lesson?.title || "Lesson"}
                    </div>

                    <div className={`${pageClassName}__lesson-progress-text`}>
                      {lesson?.description || "No description"}
                    </div>
                  </div>

                  <span
                    className={`${pageClassName}__status ${
                      isDone
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {isDone ? "Completed" : "Not completed"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </EnrollmentSectionCard>
  );
}