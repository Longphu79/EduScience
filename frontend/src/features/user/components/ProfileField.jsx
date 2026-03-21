import React from "react";

export default function ProfileField({ label, children, hint, error }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}