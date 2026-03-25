import React from "react";
import Button from "../../../shared/components/Button";
import LessonSectionCard from "./LessonSectionCard";
import LessonField from "./LessonField";

export default function LessonFormCard({
  form,
  editingLessonId,
  saving,
  onChange,
  onSubmit,
  onReset,
  pageClassName = "",
}) {
  return (
    <LessonSectionCard
      title={editingLessonId ? "Edit Lesson" : "Add Lesson"}
      description="Tạo mới hoặc cập nhật bài học cho khóa học."
      pageClassName={pageClassName}
      action={
        editingLessonId ? (
          <button
            type="button"
            onClick={onReset}
            className={`${pageClassName}__ghost-btn`}
          >
            Cancel Edit
          </button>
        ) : null
      }
    >
      <form onSubmit={onSubmit} className={`${pageClassName}__form`}>
        <LessonField label="Lesson Title" pageClassName={pageClassName}>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className={`${pageClassName}__input`}
            placeholder="Enter lesson title"
          />
        </LessonField>

        <LessonField label="Description" pageClassName={pageClassName}>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            className={`${pageClassName}__input ${pageClassName}__textarea`}
            placeholder="Enter lesson description"
          />
        </LessonField>

        <LessonField
          label="Video URL"
          hint="Supports YouTube watch URL or embed URL"
          pageClassName={pageClassName}
        >
          <input
            name="videoUrl"
            value={form.videoUrl}
            onChange={onChange}
            className={`${pageClassName}__input`}
            placeholder="https://youtube.com/watch?v=..."
          />
        </LessonField>

        <LessonField
          label="Material URL"
          hint="Optional lesson material link"
          pageClassName={pageClassName}
        >
          <input
            name="materialUrl"
            value={form.materialUrl}
            onChange={onChange}
            className={`${pageClassName}__input`}
            placeholder="Optional material link"
          />
        </LessonField>

        <div className={`${pageClassName}__form-grid`}>
          <LessonField label="Duration (minutes)" pageClassName={pageClassName}>
            <input
              type="number"
              min="0"
              name="duration"
              value={form.duration}
              onChange={onChange}
              className={`${pageClassName}__input`}
            />
          </LessonField>

          <LessonField label="Order" pageClassName={pageClassName}>
            <input
              type="number"
              min="1"
              name="order"
              value={form.order}
              onChange={onChange}
              className={`${pageClassName}__input`}
            />
          </LessonField>
        </div>

        <div className={`${pageClassName}__checks`}>
          <label className={`${pageClassName}__check`}>
            <input
              type="checkbox"
              name="isPreview"
              checked={form.isPreview}
              onChange={onChange}
            />
            Preview lesson
          </label>

          <label className={`${pageClassName}__check`}>
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={onChange}
            />
            Published
          </label>
        </div>

        <div>
          <Button type="submit" disabled={saving}>
            {saving
              ? editingLessonId
                ? "Saving..."
                : "Creating..."
              : editingLessonId
              ? "Save Lesson"
              : "Create Lesson"}
          </Button>
        </div>
      </form>
    </LessonSectionCard>
  );
}