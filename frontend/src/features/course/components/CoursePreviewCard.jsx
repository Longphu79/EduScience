import {
  getCoursePreviewImage,
  getCoursePreviewVideo,
  getCoursePriceMeta,
} from "../utils/course.helpers";

export default function CoursePreviewCard({
  form,
  pageClass = "create-course-page",
}) {
  const thumbnailPreview = getCoursePreviewImage(form?.thumbnail);
  const previewVideoUrl = getCoursePreviewVideo(form?.previewVideo);
  const { displayPrice } = getCoursePriceMeta(form);

  return (
    <>
      <div className={`${pageClass}__preview-card`}>
        <div className={`${pageClass}__preview-media`}>
          <img
            src={thumbnailPreview}
            alt={form?.title || "Course preview"}
            className={`${pageClass}__preview-image`}
          />
        </div>

        <div className={`${pageClass}__preview-body`}>
          <div className={`${pageClass}__preview-badges`}>
            <span
              className={`${pageClass}__preview-badge ${pageClass}__preview-badge--violet`}
            >
              {form?.category || "General"}
            </span>

            <span className={`${pageClass}__preview-badge`}>
              {form?.level}
            </span>

            <span className={`${pageClass}__preview-badge`}>
              {form?.isFree ? "Free" : "Paid"}
            </span>

            {form?.isPopular ? (
              <span
                className={`${pageClass}__preview-badge ${pageClass}__preview-badge--amber`}
              >
                Popular
              </span>
            ) : null}
          </div>

          <h3 className={`${pageClass}__preview-title`}>
            {form?.title || "Course title preview"}
          </h3>

          <p className={`${pageClass}__preview-text`}>
            {form?.shortDescription || "Short description preview"}
          </p>

          <div className={`${pageClass}__preview-grid`}>
            <div className={`${pageClass}__preview-stat`}>
              <div className={`${pageClass}__preview-stat-label`}>Price</div>
              <div className={`${pageClass}__preview-stat-value`}>
                {displayPrice}
              </div>
            </div>

            <div className={`${pageClass}__preview-stat`}>
              <div className={`${pageClass}__preview-stat-label`}>Duration</div>
              <div className={`${pageClass}__preview-stat-value`}>
                {form?.duration || 0} minutes
              </div>
            </div>

            <div className={`${pageClass}__preview-stat`}>
              <div className={`${pageClass}__preview-stat-label`}>Language</div>
              <div className={`${pageClass}__preview-stat-value`}>
                {form?.language || "N/A"}
              </div>
            </div>

            <div className={`${pageClass}__preview-stat`}>
              <div className={`${pageClass}__preview-stat-label`}>Status</div>
              <div
                className={`${pageClass}__preview-stat-value ${pageClass}__preview-stat-value--capitalize`}
              >
                {form?.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewVideoUrl ? (
        <div className={`${pageClass}__video-frame`}>
          <iframe
            title="preview-video"
            src={previewVideoUrl}
            className={`${pageClass}__iframe`}
            allowFullScreen
          />
        </div>
      ) : null}
    </>
  );
}