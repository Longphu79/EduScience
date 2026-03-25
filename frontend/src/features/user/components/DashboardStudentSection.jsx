import React from "react";
import { Link } from "react-router-dom";
import { User, Sparkles, BadgeCheck } from "lucide-react";
import ProfileStatCard from "./ProfileStatCard";
import ProfileSectionCard from "./ProfileSectionCard";
import ProfileEmptySection from "./ProfileEmptySection";
import ContinueLearningCard from "./ContinueLearningCard";
import ProfileIdentityPanel from "./ProfileIdentityPanel";
import ProfileTagPanel from "./ProfileTagPanel";

export default function DashboardStudentSection({
  user,
  summary,
  chips = [],
}) {
  const continueCourses = Array.isArray(summary?.continueLearningCourses)
    ? summary.continueLearningCourses
    : [];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProfileStatCard
          label="Enrolled Courses"
          value={summary?.totalEnrolledCourses || 0}
          hint="All courses you joined"
          tone="indigo"
        />
        <ProfileStatCard
          label="In Progress"
          value={summary?.totalInProgressCourses || 0}
          hint="Courses you are currently learning"
          tone="amber"
        />
        <ProfileStatCard
          label="Completed Courses"
          value={summary?.totalCompletedCourses || 0}
          hint="Finished learning journeys"
          tone="emerald"
        />
        <ProfileStatCard
          label="Certificates"
          value={summary?.certificateCount || 0}
          hint="Certificates you have earned"
          tone="rose"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ProfileStatCard
          label="Lessons Done"
          value={`${summary?.totalCompletedLessons || 0}/${
            summary?.totalLessonCount || 0
          }`}
          hint="Completed lessons across all enrolled courses"
          tone="cyan"
        />
        <ProfileStatCard
          label="Pending Quizzes"
          value={summary?.pendingQuizCount || 0}
          hint="Quizzes you still need to do"
          tone="amber"
        />
        <ProfileStatCard
          label="Pending Assignments"
          value={summary?.pendingAssignmentCount || 0}
          hint="Assignments not submitted yet"
          tone="slate"
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
            title="Learning focus"
            description="What you are currently trying to achieve."
            icon={Sparkles}
            iconToneClass="bg-blue-50 text-blue-700"
            tags={chips}
            emptyText="No learning goals added yet."
          />
        </section>

        <section className="space-y-6">
          <ProfileSectionCard
            title="Continue learning"
            description="Pick up where you left off."
            action={
              <Link
                to="/my-courses"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View all my courses
              </Link>
            }
          >
            {!continueCourses.length ? (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                No courses available yet.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {continueCourses.map((course, index) => (
                  <ContinueLearningCard
                    key={course?.enrollmentId || course?.courseId || index}
                    course={course}
                  />
                ))}
              </div>
            )}
          </ProfileSectionCard>

          <ProfileEmptySection
            title="Certificates section ready for next step"
            description="This block can be connected next to show your earned certificates in detail."
            icon={BadgeCheck}
          />
        </section>
      </div>
    </>
  );
}