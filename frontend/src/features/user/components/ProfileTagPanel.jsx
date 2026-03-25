import React from "react";

export default function ProfileTagPanel({
  title,
  description,
  icon: Icon,
  iconToneClass = "bg-blue-50 text-blue-700",
  tags = [],
  emptyText = "No items yet.",
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconToneClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}