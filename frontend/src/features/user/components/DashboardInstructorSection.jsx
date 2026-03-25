import React from "react";
import { Link } from "react-router-dom";
import { User, Sparkles } from "lucide-react";
import ProfileStatCard from "./ProfileStatCard";
import ProfileSectionCard from "./ProfileSectionCard";
import InstructorCourseCard from "./InstructorCourseCard";
import ProfileIdentityPanel from "./ProfileIdentityPanel";
import ProfileTagPanel from "./ProfileTagPanel";

export default function DashboardInstructorSection({
  user,
  summary,
  chips = [],
}) {
  const latestCourses = Array.isArray(summary?.latestCourses)
    ? summary.latestCourses
    : [];

  return (
    <>
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
          hint="Across all your courses"
          tone="emerald"
        />
        <ProfileStatCard
          label="Pending Grading"
          value={summary?.pendingAssignmentGradingCount || 0}
          hint="Assignment submissions waiting"
          tone="amber"
        />
        <ProfileStatCard
          label="Unread Chats"
          value={summary?.unreadConversationCount || 0}
          hint="Student conversations not opened yet"
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <ProfileIdentityPanel
            title="Personal information"
            description="Main information used across your account."
            icon={User}
            iconToneClass="bg-violet-50 text-violet-700"
            user={user}
          />

          <ProfileTagPanel
            title="Professional focus"
            description="What you specialize in."
            icon={Sparkles}
            iconToneClass="bg-blue-50 text-blue-700"
            tags={chips}
            emptyText="No expertise added yet."
          />
        </section>

        <section className="space-y-6">
          <ProfileSectionCard
            title="Latest teaching courses"
            description="Your newest teaching courses."
            action={
              <Link
                to="/instructor/courses"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View all
              </Link>
            }
          >
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
          </ProfileSectionCard>
        </section>
      </div>
    </>
  );
}