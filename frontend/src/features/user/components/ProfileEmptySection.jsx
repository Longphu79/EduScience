import React from "react";

export default function ProfileEmptySection({
  title,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}