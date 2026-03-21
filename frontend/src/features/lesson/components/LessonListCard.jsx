import React from "react";
import LessonSectionCard from "./LessonSectionCard";
import { formatDuration, getLessonId } from "../utils/lesson.helpers";

export default function LessonListCard({
  lessons = [],
  deletingId,
  onEdit,
  onDelete,
  pageClassName = "",
}) {
  return (
    <LessonSectionCard
      title="Course Lessons"
      description={`Total lessons: ${lessons.length}`}
      pageClassName={pageClassName}
    >
      {!lessons.length ? (
        <div className={`${pageClassName}__empty`}>
          <h3 className={`${pageClassName}__empty-title`}>
            Chưa có bài học nào
          </h3>
          <p className={`${pageClassName}__empty-text`}>
            Hãy tạo bài học đầu tiên cho khóa học này.
          </p>
        </div>
      ) : (
        <div className={`${pageClassName}__lesson-list`}>
          {lessons.map((lesson, index) => {
            const lessonId = getLessonId(lesson);

            return (
              <div
                key={lessonId || index}
                className={`${pageClassName}__lesson-item`}
              >
                <div className={`${pageClassName}__lesson-row`}>
                  <div className={`${pageClassName}__lesson-main`}>
                    <div className={`${pageClassName}__lesson-head`}>
                      <span className={`${pageClassName}__lesson-index`}>
                        {index + 1}
                      </span>

                      <h3 className={`${pageClassName}__lesson-title`}>
                        {lesson.title || "Untitled lesson"}
                      </h3>

                      <span
                        className={`${pageClassName}__badge ${
                          lesson.isPublished
                            ? `${pageClassName}__badge--emerald`
                            : `${pageClassName}__badge--amber`
                        }`}
                      >
                        {lesson.isPublished ? "Published" : "Draft"}
                      </span>

                      {lesson.isPreview ? (
                        <span
                          className={`${pageClassName}__badge ${pageClassName}__badge--blue`}
                        >
                          Preview
                        </span>
                      ) : null}
                    </div>

                    <p className={`${pageClassName}__lesson-desc`}>
                      {lesson.description || "No description"}
                    </p>

                    <div className={`${pageClassName}__lesson-meta`}>
                      <span className={`${pageClassName}__chip`}>
                        Order: {lesson.order || 0}
                      </span>
                      <span className={`${pageClassName}__chip`}>
                        Duration: {formatDuration(lesson.duration)}
                      </span>
                      <span className={`${pageClassName}__chip`}>
                        Material: {lesson.materialUrl ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className={`${pageClassName}__lesson-links`}>
                      {lesson.videoUrl ? (
                        <a
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`${pageClassName}__text-link ${pageClassName}__text-link--violet`}
                        >
                          Open video
                        </a>
                      ) : null}

                      {lesson.materialUrl ? (
                        <a
                          href={lesson.materialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`${pageClassName}__text-link ${pageClassName}__text-link--blue`}
                        >
                          Open material
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className={`${pageClassName}__lesson-actions`}>
                    <button
                      type="button"
                      onClick={() => onEdit(lesson)}
                      className={`${pageClassName}__action-btn`}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(lessonId, lesson.title)}
                      disabled={deletingId === lessonId}
                      className={`${pageClassName}__action-btn ${pageClassName}__action-btn--danger`}
                    >
                      {deletingId === lessonId ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </LessonSectionCard>
  );
}