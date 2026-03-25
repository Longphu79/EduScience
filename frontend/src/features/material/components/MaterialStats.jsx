import React from "react";
import { formatFileSize } from "../utils/material.helpers";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export default function MaterialStats({
  totalCount = 0,
  publishedCount = 0,
  lessonAttachedCount = 0,
  courseLevelCount = 0,
  totalFileSize = 0,
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total materials" value={totalCount} />
      <StatCard label="Published" value={publishedCount} />
      <StatCard
        label="Attached to lesson"
        value={lessonAttachedCount}
        hint={`${courseLevelCount} course-level materials`}
      />
      <StatCard label="Total file size" value={formatFileSize(totalFileSize)} />
    </section>
  );
}