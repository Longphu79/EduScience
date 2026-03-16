import React from "react";

function formatFileSize(fileSize = 0) {
  if (!fileSize) return "N/A";
  if (fileSize < 1024) return `${fileSize} B`;
  if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`;
  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialList({ materials = [] }) {
  if (!materials.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
        Không có tài liệu.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {materials.map((item, index) => (
        <div
          key={item._id || index}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {index + 1}
                </span>

                <h4 className="text-lg font-semibold text-slate-900">
                  {item.title || "Untitled Material"}
                </h4>
              </div>

              <p className="text-slate-600">
                {item.description || "Chưa có mô tả cho tài liệu này."}
              </p>

              <div className="flex flex-wrap gap-3 pt-1 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  File: {item.fileName || "N/A"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Type: {item.fileType || "Unknown"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Size: {formatFileSize(item.fileSize)}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Open Material
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}