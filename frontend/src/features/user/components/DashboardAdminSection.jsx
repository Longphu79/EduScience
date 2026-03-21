import React from "react";
import {
  ShieldCheck,
  Users,
  FolderKanban,
  LayoutDashboard,
} from "lucide-react";
import ProfileStatCard from "./ProfileStatCard";
import ProfileSectionCard from "./ProfileSectionCard";
import ProfileEmptySection from "./ProfileEmptySection";
import DashboardQuickAccessCard from "./DashboardQuickAccessCard";
import ProfileIdentityPanel from "./ProfileIdentityPanel";

export default function DashboardAdminSection({
  currentUserId,
  user,
  summary,
}) {
  const adminStats = summary?.stats || {};

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProfileStatCard
          label="Total Users"
          value={adminStats.totalUsers || 0}
          hint="All registered accounts"
          tone="red"
        />
        <ProfileStatCard
          label="Students"
          value={adminStats.totalStudents || 0}
          hint="Student accounts on platform"
          tone="emerald"
        />
        <ProfileStatCard
          label="Courses"
          value={adminStats.totalCourses || 0}
          hint="All created courses"
          tone="indigo"
        />
        <ProfileStatCard
          label="Enrollments"
          value={adminStats.totalEnrollments || 0}
          hint="All learning enrollments"
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <ProfileIdentityPanel
            title="Admin information"
            description="Main information used across your account."
            icon={ShieldCheck}
            iconToneClass="bg-red-50 text-red-700"
            user={user}
          />

          <ProfileSectionCard
            title="Admin quick access"
            description="Fast entry points for platform management."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DashboardQuickAccessCard
                title="Admin Dashboard"
                description="View the full platform overview, latest users and top courses."
                to="/admin/dashboard"
                icon={LayoutDashboard}
                tone="red"
              />
              <DashboardQuickAccessCard
                title="Manage Users"
                description="Review user accounts, inspect details and change active status."
                to="/admin/users"
                icon={Users}
                tone="indigo"
              />
              <DashboardQuickAccessCard
                title="Manage Courses"
                description="Review course status, publish flow and instructor ownership."
                to="/admin/courses"
                icon={FolderKanban}
                tone="emerald"
              />
              <DashboardQuickAccessCard
                title="Public Profile"
                description="See how your public-facing profile appears to others."
                to={`/users/${currentUserId}`}
                icon={ShieldCheck}
                tone="amber"
              />
            </div>
          </ProfileSectionCard>
        </section>

        <section className="space-y-6">
          <ProfileSectionCard
            title="Platform overview"
            description="Quick operational summary from admin dashboard."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileStatCard
                label="Active Users"
                value={adminStats.totalActiveUsers || 0}
                hint="Accounts currently active"
                tone="emerald"
              />
              <ProfileStatCard
                label="Published Courses"
                value={adminStats.totalPublishedCourses || 0}
                hint="Courses visible on platform"
                tone="indigo"
              />
              <ProfileStatCard
                label="Draft Courses"
                value={adminStats.totalDraftCourses || 0}
                hint="Courses not published yet"
                tone="amber"
              />
              <ProfileStatCard
                label="Completed Enrollments"
                value={adminStats.completedEnrollments || 0}
                hint="Finished learning records"
                tone="rose"
              />
            </div>
          </ProfileSectionCard>

          <ProfileEmptySection
            title="Admin analytics can grow further"
            description="Later you can extend this area with revenue reports, moderation queue, approval flows and platform alerts."
            icon={ShieldCheck}
          />
        </section>
      </div>
    </>
  );
}