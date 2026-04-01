import React from "react";
import {
  formatFileSize,
  getMaterialId,
} from "../utils/material.helpers";


export default function MaterialListItem({
  item,
  index = 0,
  lessonTitle = null,
  showActions = false,
  onEdit,
  onDelete,
  deleting = false,
}) {
  const materialId = getMaterialId(item);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-sm font-bold text-slate-700">
              {index + 1}
            </span>

            <h3 className="truncate text-lg font-bold text-slate-900">
              {item?.title || "Untitled material"}
            </h3>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                item?.isPublished
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {item?.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            {item?.description || "No description"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Lesson: {lessonTitle || "Course-level material"}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Type: {item?.fileType || "Unknown"}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Size: {formatFileSize(item?.fileSize)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Name: {item?.fileName || "N/A"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {item?.fileUrl ? (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open file
              </a>
            ) : null}
          </div>
        </div>

        {showActions ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete?.(materialId, item?.title || "material")}
              disabled={deleting}
              className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}