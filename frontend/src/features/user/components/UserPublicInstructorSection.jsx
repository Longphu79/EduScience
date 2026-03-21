import React from "react";
import { User, MessageSquareQuote, BookOpen } from "lucide-react";
import ProfileStatCard from "./ProfileStatCard";
import InstructorCourseCard from "./InstructorCourseCard";

export default function UserPublicInstructorSection({
  profile,
  roleMeta,
  tags = [],
  summaryLoading,
  summary,
  latestCourses = [],
}) {
  return (
    <>
      {summaryLoading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading teaching overview...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProfileStatCard
            label="Total Courses"
            value={summary?.totalCourses || 0}
            hint="Courses currently managed"
            tone="indigo"
          />
          <ProfileStatCard
            label="Total Students"
            value={summary?.totalStudents || 0}
            hint="Across public teaching courses"
            tone="emerald"
          />
          <ProfileStatCard
            label="Pending Grading"
            value={summary?.pendingAssignmentGradingCount || 0}
            hint="Current grading workload"
            tone="amber"
          />
          <ProfileStatCard
            label="Unread Chats"
            value={summary?.unreadConversationCount || 0}
            hint="Open conversations"
            tone="rose"
          />
        </div>
      )}

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
                <h2 className="text-xl font-bold text-slate-900">Expertise</h2>
                <p className="text-sm text-slate-500">
                  Skills and areas of focus.
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
              <p className="text-sm text-slate-500">No expertise added yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Latest teaching courses
                </h2>
                <p className="text-sm text-slate-500">
                  Public teaching courses from this instructor.
                </p>
              </div>
            </div>

            {!latestCourses.length ? (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                No teaching courses yet.
              </div>
            ) : (
              <div className="grid gap-5">
                {latestCourses.map((course, index) => (
                  <InstructorCourseCard
                    key={course?._id || course?.id || course?.courseId || index}
                    course={course}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}