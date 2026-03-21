import Button from "../../../shared/components/Button";
import CourseSectionCard from "./CourseSectionCard";
import CourseFormField from "./CourseFormField";
import CoursePreviewCard from "./CoursePreviewCard";

export default function CourseEditorForm({
  form,
  shortDescriptionCount,
  pageClass = "edit-course-page",
  submitLabel = "Save Changes",
  submitLoadingLabel = "Saving...",
  submitting = false,
  deleting = false,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}) {
  return (
    <form onSubmit={onSubmit} className={`${pageClass}__layout`}>
      <div className={`${pageClass}__left`}>
        <CourseSectionCard
          title="Basic Information"
          description="Chỉnh sửa thông tin chính của khóa học."
        >
          <div className={`${pageClass}__grid ${pageClass}__grid--two`}>
            <div className={`${pageClass}__span-2`}>
              <CourseFormField
                label="Course Title"
                pageClass={pageClass}
              >
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  className={`${pageClass}__input`}
                />
              </CourseFormField>
            </div>

            <CourseFormField label="Slug" pageClass={pageClass}>
              <input
                name="slug"
                value={form.slug}
                onChange={onChange}
                className={`${pageClass}__input`}
              />
            </CourseFormField>

            <CourseFormField label="Category" pageClass={pageClass}>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className={`${pageClass}__input`}
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="ui-ux">UI/UX</option>
                <option value="Mobile Development">Mobile Development</option>
              </select>
            </CourseFormField>

            <div className={`${pageClass}__span-2`}>
              <CourseFormField
                label="Short Description"
                hint={`${shortDescriptionCount}/160 characters`}
                pageClass={pageClass}
              >
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={onChange}
                  required
                  rows={3}
                  maxLength={160}
                  className={`${pageClass}__textarea`}
                />
              </CourseFormField>
            </div>

            <div className={`${pageClass}__span-2`}>
              <CourseFormField
                label="Full Description"
                pageClass={pageClass}
              >
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={6}
                  className={`${pageClass}__textarea`}
                />
              </CourseFormField>
            </div>
          </div>
        </CourseSectionCard>

        <CourseSectionCard
          title="Media"
          description="Cập nhật thumbnail và video preview của khóa học."
        >
          <div className={`${pageClass}__grid ${pageClass}__grid--two`}>
            <CourseFormField
              label="Thumbnail URL"
              pageClass={pageClass}
            >
              <input
                name="thumbnail"
                value={form.thumbnail}
                onChange={onChange}
                className={`${pageClass}__input`}
              />
            </CourseFormField>

            <CourseFormField
              label="Preview Video URL"
              pageClass={pageClass}
            >
              <input
                name="previewVideo"
                value={form.previewVideo}
                onChange={onChange}
                className={`${pageClass}__input`}
              />
            </CourseFormField>
          </div>
        </CourseSectionCard>

        <CourseSectionCard
          title="Course Settings"
          description="Điều chỉnh level, pricing, duration và trạng thái khóa học."
        >
          <div className={`${pageClass}__grid ${pageClass}__grid--two`}>
            <CourseFormField label="Level" pageClass={pageClass}>
              <select
                name="level"
                value={form.level}
                onChange={onChange}
                className={`${pageClass}__input`}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </CourseFormField>

            <CourseFormField label="Language" pageClass={pageClass}>
              <input
                name="language"
                value={form.language}
                onChange={onChange}
                className={`${pageClass}__input`}
              />
            </CourseFormField>

            <CourseFormField
              label="Duration (minutes)"
              pageClass={pageClass}
            >
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={onChange}
                className={`${pageClass}__input`}
              />
            </CourseFormField>

            <CourseFormField label="Status" pageClass={pageClass}>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className={`${pageClass}__input`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </CourseFormField>

            <CourseFormField label="Price" pageClass={pageClass}>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={onChange}
                disabled={form.isFree}
                className={`${pageClass}__input`}
              />
            </CourseFormField>

            <CourseFormField label="Sale Price" pageClass={pageClass}>
              <input
                type="number"
                name="salePrice"
                value={form.salePrice}
                onChange={onChange}
                disabled={form.isFree}
                className={`${pageClass}__input`}
              />
            </CourseFormField>

            <div className={`${pageClass}__span-2 ${pageClass}__checks`}>
              <label className={`${pageClass}__checkbox`}>
                <input
                  type="checkbox"
                  name="isFree"
                  checked={form.isFree}
                  onChange={onChange}
                />
                Free Course
              </label>

              <label className={`${pageClass}__checkbox`}>
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={form.isPopular}
                  onChange={onChange}
                />
                Popular Course
              </label>
            </div>
          </div>
        </CourseSectionCard>

        <div className={`${pageClass}__actions`}>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {submitting ? submitLoadingLabel : submitLabel}
          </Button>

          <button
            type="button"
            onClick={onCancel}
            className={`${pageClass}__secondary-btn`}
          >
            Cancel
          </button>

          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className={`${pageClass}__danger-btn`}
            >
              {deleting ? "Deleting..." : "Delete Course"}
            </button>
          ) : null}
        </div>
      </div>

      <div className={`${pageClass}__right`}>
        <CourseSectionCard
          title="Live Preview"
          description="Xem trước giao diện hiển thị của khóa học."
        >
          <CoursePreviewCard form={form} pageClass={pageClass} />
        </CourseSectionCard>
      </div>
    </form>
  );
}