import React from "react";
import Button from "../../../shared/components/Button";

export default function MaterialForm({
  form,
  lessons = [],
  editingMaterialId = "",
  saving = false,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {editingMaterialId ? "Edit Material" : "Add Material"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tạo mới hoặc cập nhật tài liệu cho khóa học.
          </p>
        </div>

        {editingMaterialId ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel Edit
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-5">
        <Field label="Title">
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Enter material title"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            placeholder="Enter material description"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="File URL">
            <input
              name="fileUrl"
              value={form.fileUrl}
              onChange={onChange}
              placeholder="https://..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
            />
          </Field>

          <Field label="File name">
            <input
              name="fileName"
              value={form.fileName}
              onChange={onChange}
              placeholder="document.pdf"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Field label="File type">
            <input
              name="fileType"
              value={form.fileType}
              onChange={onChange}
              placeholder="pdf / docx / pptx"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
            />
          </Field>

          <Field label="File size (bytes)">
            <input
              type="number"
              min="0"
              name="fileSize"
              value={form.fileSize}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
            />
          </Field>

          <Field label="Attach to lesson">
            <select
              name="lessonId"
              value={form.lessonId}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
            >
              <option value="">Course-level material</option>
              {lessons.map((lesson, index) => (
                <option
                  key={lesson?._id || lesson?.id || index}
                  value={lesson?._id || lesson?.id || ""}
                >
                  {lesson?.title || `Lesson ${index + 1}`}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isPublished"
            checked={form.isPublished}
            onChange={onChange}
          />
          Published
        </label>

        <div>
          <Button type="submit" disabled={saving}>
            {saving
              ? editingMaterialId
                ? "Saving..."
                : "Creating..."
              : editingMaterialId
              ? "Save Material"
              : "Create Material"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}