import React from "react";

export default function ProfileIdentityPanel({
  title,
  description,
  icon: Icon,
  iconToneClass = "bg-violet-50 text-violet-700",
  user,
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Full name
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {user?.fullName || "--"}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Username
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {user?.username || "--"}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Email
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {user?.email || "--"}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Phone
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {user?.phone || "--"}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Bio
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {user?.bio || "No bio yet."}
        </p>
      </div>
    </div>
  );
}