import React from "react";
import { Link } from "react-router-dom";
import { Lock, PencilLine } from "lucide-react";

export default function DashboardHero({
  currentUserId,
  user,
  isAdmin,
  isInstructor,
  displayName,
  avatar,
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div
        className={`h-40 ${
          isAdmin
            ? "bg-gradient-to-r from-red-600 via-rose-600 to-orange-500"
            : "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500"
        }`}
      />

      <div className="relative px-6 pb-6">
        <div className="-mt-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <img
              src={avatar}
              alt={displayName}
              className="h-28 w-28 rounded-[28px] border-4 border-white object-cover shadow-lg"
            />

            <div className="pb-1">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                  isAdmin
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {user?.role || "user"}
              </div>

              <h1 className="mt-3 text-[2.1rem] font-black tracking-tight text-slate-950">
                {displayName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {user?.headline ||
                  (isAdmin
                    ? "Monitor the platform, manage users, and maintain system quality."
                    : isInstructor
                    ? "Share knowledge, guide learners, and build impact."
                    : "Keep learning consistently and grow step by step.")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/users/${currentUserId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View public profile
            </Link>

            <Link
              to="/profile/change-password"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Lock className="h-4 w-4" />
              Change password
            </Link>

            <Link
              to="/profile/edit"
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 font-semibold text-white shadow-[0_16px_30px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 ${
                isAdmin
                  ? "bg-gradient-to-r from-red-600 to-rose-600"
                  : "bg-gradient-to-r from-violet-600 to-blue-600"
              }`}
            >
              <PencilLine className="h-4 w-4" />
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}