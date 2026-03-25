import React from "react";

export default function ProfileInfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">
        {value || "--"}
      </div>
    </div>
  );
}