import React from "react";
import { Link } from "react-router-dom";
import { DEFAULT_AVATAR } from "../utils/user.helpers";

export default function UserPublicHero({
  displayName,
  avatar,
  coverImage,
  roleMeta,
  isAdmin,
  isOwnProfile,
  profile,
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = roleMeta.coverFallback;
          }}
        />
        <div
          className={`absolute inset-0 ${
            isAdmin
              ? "bg-gradient-to-t from-red-950/55 via-red-900/10 to-transparent"
              : "bg-gradient-to-t from-slate-950/50 via-slate-900/10 to-transparent"
          }`}
        />
      </div>

      <div className="relative px-6 pb-6">
        <div className="-mt-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <img
              src={avatar}
              alt={displayName}
              className="h-28 w-28 rounded-[28px] border-4 border-white object-cover shadow-lg"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />

            <div className="pb-1">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm ${
                  isAdmin ? "bg-red-50 text-red-700" : roleMeta.badgeClass
                }`}
              >
                {roleMeta.roleLabel}
              </div>

              <h1 className="mt-3 text-[2.1rem] font-black tracking-tight text-slate-950">
                {displayName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {profile?.headline || roleMeta.headlineFallback}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isOwnProfile ? (
              <Link
                to="/profile/edit"
                className={`inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold text-white shadow-[0_16px_30px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 ${
                  isAdmin
                    ? "bg-gradient-to-r from-red-600 to-rose-600"
                    : "bg-gradient-to-r from-violet-600 to-blue-600"
                }`}
              >
                Edit profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}