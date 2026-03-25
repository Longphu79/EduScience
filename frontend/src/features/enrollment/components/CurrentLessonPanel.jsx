import React from "react";
import {
  formatLessonDuration,
  getYoutubeEmbedUrl,
  isYouTubeUrl,
} from "../utils/enrollment.helpers";
import LearnCourseActions from "./LearnCourseActions";

export default function CurrentLessonPanel({
  currentLesson,
  currentLessonCompleted,
  nextLesson,
  actionLoading,
  progress,
  certificate,
  certificateLoading,
  courseId,
  onOpenInstructorChat,
  onCompleteLesson,
  onGenerateCertificate,
  pageClassName = "",
}) {
  return (
    <section className={`${pageClassName}__current-panel`}>
      <div className={`${pageClassName}__current-head`}>
        <div className={`${pageClassName}__current-head-row`}>
          <div className={`${pageClassName}__current-main`}>
            <div className={`${pageClassName}__current-eyebrow`}>
              Current Lesson
            </div>

            <h2 className={`${pageClassName}__current-title`}>
              {currentLesson?.title || "Bài học"}
            </h2>

            <p className={`${pageClassName}__current-text`}>
              {currentLesson?.description || "Chọn bài học để bắt đầu."}
            </p>
          </div>
        </div>
      </div>

      <div className={`${pageClassName}__current-body`}>
        {currentLesson?.videoUrl ? (
          <div className={`${pageClassName}__video-frame`}>
            {isYouTubeUrl(currentLesson.videoUrl) ? (
              <iframe
                title={currentLesson?.title || "Lesson video"}
                src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                className={`${pageClassName}__video-iframe`}
                allowFullScreen
              />
            ) : (
              <video
                src={currentLesson.videoUrl}
                controls
                className={`${pageClassName}__video-player`}
              />
            )}
          </div>
        ) : (
          <div className={`${pageClassName}__video-empty`}>
            Chưa có video cho bài học này.
          </div>
        )}

        <div className={`${pageClassName}__current-info-grid`}>
          <div className={`${pageClassName}__current-info-card`}>
            <div className={`${pageClassName}__current-info-label`}>
              Trạng thái
            </div>
            <div className={`${pageClassName}__current-info-value`}>
              {currentLessonCompleted ? "Đã hoàn thành" : "Đang học"}
            </div>
          </div>

          <div className={`${pageClassName}__current-info-card`}>
            <div className={`${pageClassName}__current-info-label`}>
              Thời lượng
            </div>
            <div className={`${pageClassName}__current-info-value`}>
              {formatLessonDuration(currentLesson)}
            </div>
          </div>

          <div className={`${pageClassName}__current-info-card`}>
            <div className={`${pageClassName}__current-info-label`}>
              Bài tiếp theo
            </div>
            <div className={`${pageClassName}__current-info-value`}>
              {nextLesson?.title || "Không còn bài học tiếp theo"}
            </div>
          </div>
        </div>

        <LearnCourseActions
          progress={progress}
          courseId={courseId}
          currentLesson={currentLesson}
          currentLessonCompleted={currentLessonCompleted}
          actionLoading={actionLoading}
          certificate={certificate}
          certificateLoading={certificateLoading}
          onOpenInstructorChat={onOpenInstructorChat}
          onCompleteLesson={onCompleteLesson}
          onGenerateCertificate={onGenerateCertificate}
          pageClassName={pageClassName}
          completeLabel="Hoàn thành bài học"
          completedLabel="Đã hoàn thành bài học"
        />
      </div>
    </section>
  );
}