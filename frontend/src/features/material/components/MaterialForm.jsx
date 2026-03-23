import React from "react";
import Button from "../../../shared/components/Button";
import { formatFileSize } from "../utils/material.helpers";

const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.mp4,.mp3,.png,.jpg,.jpeg";

export default function MaterialForm({
  form,
  lessons = [],
  editingMaterialId = "",
  saving = false,
  uploading = false,
  selectedFile = null,
  onChange,
  onFileChange,
  onSubmit,
  onReset,
}) {
  const isBusy = saving || uploading;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {editingMaterialId ? "Edit Material" : "Add Material"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tạo mới hoặc cập nhật tài liệu cho khóa học bằng cách tải file trực tiếp từ thiết bị.
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

        <Field label="Upload file">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
            <span className="text-sm font-semibold text-slate-700">
              Click to choose file
            </span>
            <span className="mt-1 text-xs text-slate-500">
              PDF, DOCX, PPTX, XLSX, ZIP, TXT, MP4, MP3, PNG, JPG...
            </span>

            <input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={onFileChange}
              className="hidden"
            />
          </label>

          {selectedFile || form.fileName ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">File name:</span>{" "}
                  {selectedFile?.name || form.fileName || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">File type:</span>{" "}
                  {form.fileType || selectedFile?.type || "Unknown"}
                </p>
                <p>
                  <span className="font-semibold">File size:</span>{" "}
                  {formatFileSize(form.fileSize)}
                </p>
                {editingMaterialId && !selectedFile && form.fileUrl ? (
                  <p className="text-xs text-slate-500">
                    Bạn đang chỉnh sửa tài liệu cũ. Có thể giữ nguyên file hiện tại hoặc chọn file mới để thay thế.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
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

          <Field label="Status">
            <label className="inline-flex h-[50px] items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={onChange}
              />
              Published
            </label>
          </Field>
        </div>

        <div>
          <Button type="submit" disabled={isBusy}>
            {uploading
              ? "Uploading..."
              : saving
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