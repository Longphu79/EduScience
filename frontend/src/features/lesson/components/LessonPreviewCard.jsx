import React, { useMemo } from "react";
import LessonSectionCard from "./LessonSectionCard";
import {
  formatDuration,
  getYoutubeEmbedUrl,
  isYouTubeUrl,
} from "../utils/lesson.helpers";

export default function LessonPreviewCard({ form, pageClassName = "" }) {
  const previewVideoEmbed = useMemo(() => {
    if (!form.videoUrl || !isYouTubeUrl(form.videoUrl)) return "";
    return getYoutubeEmbedUrl(form.videoUrl);
  }, [form.videoUrl]);

  return (
    <LessonSectionCard
      title="Lesson Preview"
      description="Xem nhanh thông tin lesson đang nhập."
      pageClassName={pageClassName}
    >
      <div className={`${pageClassName}__preview`}>
        <div className={`${pageClassName}__preview-card`}>
          <div className={`${pageClassName}__badges`}>
            <span
              className={`${pageClassName}__badge ${pageClassName}__badge--violet`}
            >
              Order {form.order || 1}
            </span>

            <span
              className={`${pageClassName}__badge ${
                form.isPublished
                  ? `${pageClassName}__badge--emerald`
                  : `${pageClassName}__badge--amber`
              }`}
            >
              {form.isPublished ? "Published" : "Draft"}
            </span>

            {form.isPreview ? (
              <span
                className={`${pageClassName}__badge ${pageClassName}__badge--blue`}
              >
                Preview
              </span>
            ) : null}
          </div>

          <h3 className={`${pageClassName}__preview-title`}>
            {form.title || "Lesson title preview"}
          </h3>

          <p className={`${pageClassName}__preview-text`}>
            {form.description || "Lesson description preview"}
          </p>

          <div className={`${pageClassName}__preview-grid`}>
            <div className={`${pageClassName}__mini-card`}>
              <div className={`${pageClassName}__mini-label`}>Duration</div>
              <div className={`${pageClassName}__mini-value`}>
                {formatDuration(form.duration)}
              </div>
            </div>

            <div className={`${pageClassName}__mini-card`}>
              <div className={`${pageClassName}__mini-label`}>Material</div>
              <div className={`${pageClassName}__mini-value`}>
                {form.materialUrl ? "Attached" : "No material"}
              </div>
            </div>
          </div>
        </div>

        {previewVideoEmbed ? (
          <div className={`${pageClassName}__video-frame`}>
            <iframe
              title="lesson-video-preview"
              src={previewVideoEmbed}
              className={`${pageClassName}__iframe`}
              allowFullScreen
            />
          </div>
        ) : (
          <div className={`${pageClassName}__video-empty`}>
            Nhập YouTube URL hợp lệ để xem preview video.
          </div>
        )}
      </div>
    </LessonSectionCard>
  );
}