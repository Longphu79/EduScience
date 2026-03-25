import React from "react";

export default function LearnCourseHero({
  course,
  progress,
  completedCount,
  totalLessons,
  nextLesson,
  pageClassName = "",
}) {
  return (
    <section className={`${pageClassName}__hero`}>
      <div className={`${pageClassName}__hero-row`}>
        <div className={`${pageClassName}__hero-main`}>
          <div className={`${pageClassName}__eyebrow`}>Learning Workspace</div>

          <h1 className={`${pageClassName}__title`}>
            {course?.title || "Khóa học"}
          </h1>

          <p className={`${pageClassName}__subtitle`}>
            {course?.description ||
              "Tiếp tục học tập, hoàn thành bài học và theo dõi tiến độ của bạn."}
          </p>
        </div>

        <div className={`${pageClassName}__hero-metrics`}>
          <MetricCard
            label="Tiến độ"
            value={`${progress}%`}
            pageClassName={pageClassName}
          />

          <MetricCard
            label="Hoàn thành"
            value={`${completedCount}/${totalLessons}`}
            pageClassName={pageClassName}
          />

          <MetricCard
            label="Bài tiếp theo"
            value={nextLesson?.title || "Sắp hoàn thành"}
            multiline
            pageClassName={pageClassName}
          />
        </div>
      </div>

      <div className={`${pageClassName}__progress-box`}>
        <div className={`${pageClassName}__progress-head`}>
          <span>Progress Overview</span>
          <span>{progress}%</span>
        </div>

        <div className={`${pageClassName}__progress-bar`}>
          <div
            className={`${pageClassName}__progress-fill`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  multiline = false,
  pageClassName = "",
}) {
  return (
    <div className={`${pageClassName}__mini-card`}>
      <div className={`${pageClassName}__mini-label`}>{label}</div>

      <div
        className={`${pageClassName}__mini-value ${
          multiline ? `${pageClassName}__mini-value--multiline` : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}