import React from "react";

export default function MaterialEmptyState({
  title = "Chưa có tài liệu nào",
  description = "Hiện chưa có tài liệu để hiển thị.",
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}