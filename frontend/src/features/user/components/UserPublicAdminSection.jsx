import React from "react";
import { ShieldCheck, BadgeCheck, LayoutDashboard } from "lucide-react";
import ProfileEmptySection from "./ProfileEmptySection";
import ProfileStatCard from "./ProfileStatCard";

export default function UserPublicAdminSection({ profile, roleMeta }) {
  return (
    <div className="user-profile-page__split">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                About this admin profile
              </h2>
              <p className="text-sm text-slate-500">
                {roleMeta.profileDescription}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Bio
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {profile?.bio || "No bio yet."}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Public role visibility
              </h2>
              <p className="text-sm text-slate-500">
                This profile highlights identity and trust rather than private
                platform controls.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileStatCard
              label="Role"
              value="ADMIN"
              hint="Platform administration role"
              tone="red"
            />
            <ProfileStatCard
              label="Status"
              value={profile?.isActive === false ? "Inactive" : "Active"}
              hint="Public-facing account status"
              tone="emerald"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <ProfileEmptySection
          title="Private admin controls are hidden"
          description="Administrative tools, user management, course moderation and internal dashboards are intentionally not exposed on the public profile."
          icon={LayoutDashboard}
        />

        <ProfileEmptySection
          title="Privacy-first public profile"
          description="Only safe public information is shown here, such as role, identity, avatar, cover image, headline and bio."
          icon={ShieldCheck}
        />
      </section>
    </div>
  );
}