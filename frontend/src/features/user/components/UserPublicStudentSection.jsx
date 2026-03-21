import React from "react";
import { User, MessageSquareQuote, GraduationCap, BadgeCheck } from "lucide-react";
import ProfileEmptySection from "./ProfileEmptySection";

export default function UserPublicStudentSection({ profile, roleMeta, tags = [] }) {
  return (
    <div className="user-profile-page__split">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                About this profile
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
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Learning goals
              </h2>
              <p className="text-sm text-slate-500">
                Current learning objectives.
              </p>
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
            <p className="text-sm text-slate-500">No learning goals added yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <ProfileEmptySection
          title="Learner public profile"
          description="This public profile intentionally keeps learning progress, private dashboard stats, certificates, and assignments hidden."
          icon={GraduationCap}
        />

        <ProfileEmptySection
          title="Privacy-first design"
          description="Only safe public information is shown here, such as headline, bio, avatar, cover image, and learning goals."
          icon={BadgeCheck}
        />
      </section>
    </div>
  );
}