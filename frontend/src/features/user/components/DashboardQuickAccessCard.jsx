import React from "react";
import { Link } from "react-router-dom";

export default function DashboardQuickAccessCard({
  title,
  description,
  to,
  icon: Icon,
  tone = "slate",
}) {
  const toneMap = {
    slate: "bg-slate-50 text-slate-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <Link
      to={to}
      className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneMap[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

      <div className="mt-4 text-sm font-semibold text-violet-700 transition group-hover:text-violet-800">
        Open →
      </div>
    </Link>
  );
}