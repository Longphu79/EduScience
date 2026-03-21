import React from "react";

export default function StudentDetailHero({
  studentName,
  student,
  course,
  progress,
  enrollment,
  pageClassName = "",
}) {
  return (
    <section className={`${pageClassName}__detail-hero`}>
      <div className={`${pageClassName}__detail-hero-bg`}>
        <div className={`${pageClassName}__detail-hero-grid`}>
          <div className={`${pageClassName}__detail-hero-main`}>
            <div className={`${pageClassName}__detail-student`}>
              <div className={`${pageClassName}__detail-avatar`}>
                {(studentName || "S").slice(0, 1)}
              </div>

              <div className={`${pageClassName}__detail-info`}>
                <h2 className={`${pageClassName}__detail-name`}>
                  {studentName}
                </h2>
                <p className={`${pageClassName}__detail-email`}>
                  {student?.email || "No email available"}
                </p>

                <div className={`${pageClassName}__detail-pills`}>
                  <span className={`${pageClassName}__detail-pill`}>
                    Role: {student?.role || "student"}
                  </span>
                  <span className={`${pageClassName}__detail-pill`}>
                    Course: {course?.title || "N/A"}
                  </span>
                  <span className={`${pageClassName}__detail-pill`}>
                    Progress: {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${pageClassName}__detail-summary`}>
            <div className={`${pageClassName}__detail-summary-label`}>
              Overall progress
            </div>
            <div className={`${pageClassName}__detail-summary-value`}>
              {progress}%
            </div>

            <div className={`${pageClassName}__detail-summary-bar`}>
              <div
                className={`${pageClassName}__detail-summary-fill`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>

            <div className={`${pageClassName}__detail-summary-text`}>
              Status:{" "}
              <span className={`${pageClassName}__detail-summary-strong`}>
                {enrollment?.completed ? "Completed" : "In progress"}
              </span>
            </div>

            <div className={`${pageClassName}__detail-summary-subtext`}>
              Last lesson:{" "}
              <span className={`${pageClassName}__detail-summary-strong`}>
                {enrollment?.lastLessonId?.title ||
                  enrollment?.lastLessonId ||
                  "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}