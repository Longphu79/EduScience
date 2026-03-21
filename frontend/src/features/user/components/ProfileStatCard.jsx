import React from "react";

export default function ProfileStatCard({
  label,
  value,
  hint,
  tone = "slate",
}) {
  const toneMap = {
    slate: "from-slate-700 to-slate-900",
    indigo: "from-indigo-500 to-blue-500",
    emerald: "from-emerald-500 to-green-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
    red: "from-red-500 to-rose-500",
    cyan: "from-cyan-500 to-sky-500",
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </div>
          <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </div>
          {hint ? <div className="mt-2 text-sm text-slate-500">{hint}</div> : null}
        </div>

        <div
          className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${
            toneMap[tone] || toneMap.slate
          }`}
        />
      </div>
    </div>
  );
}