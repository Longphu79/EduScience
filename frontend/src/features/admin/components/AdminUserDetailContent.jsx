import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import {
  formatAdminDate,
  formatAdminNumber,
} from "../utils/admin.helpers";

function SummaryCard({ label, value, tone = "slate", hint }) {
  return (
    <div className="admin-user-detail-summary-card">
      <div className="admin-user-detail-summary-card__top">
        <div>
          <div className="admin-user-detail-summary-card__label">{label}</div>
          <div className="admin-user-detail-summary-card__value">{value}</div>
          {hint ? (
            <div className="admin-user-detail-summary-card__hint">{hint}</div>
          ) : null}
        </div>
        <div
          className={`admin-user-detail-summary-card__icon admin-user-detail-summary-card__icon--${tone}`}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="admin-user-detail-section-card">
      <div className="admin-user-detail-section-card__header">
        <div>
          <h2 className="admin-user-detail-section-card__title">{title}</h2>
          {subtitle ? (
            <p className="admin-user-detail-section-card__subtitle">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="admin-user-detail-section-card__body">{children}</div>
    </section>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="admin-user-detail-info-tile">
      <div className="admin-user-detail-info-tile__label-wrap">
        {Icon ? <Icon className="admin-user-detail-info-tile__icon" /> : null}
        <div className="admin-user-detail-info-tile__label">{label}</div>
      </div>
      <div className="admin-user-detail-info-tile__value">{value || "N/A"}</div>
    </div>
  );
}

function TimelineItem({ title, description, tone = "slate" }) {
  return (
    <div className="admin-user-detail-timeline-item">
      <div className="admin-user-detail-timeline-item__dot" />
      <div
        className={`admin-user-detail-timeline-item__title admin-user-detail-timeline-item__title--${tone}`}
      >
        {title}
      </div>
      <div className="admin-user-detail-timeline-item__description">
        {description}
      </div>
    </div>
  );
}

function DetailEmptyBlock({ title, description }) {
  return (
    <div className="admin-user-detail-empty-block">
      <h3 className="admin-user-detail-empty-block__title">{title}</h3>
      <p className="admin-user-detail-empty-block__description">{description}</p>
    </div>
  );
}

export default function AdminUserDetailContent({ user, summary = {} }) {
  if (!user) return null;

  const statusTone = user.isActive ? "emerald" : "red";

  return (
    <>
      <div className="admin-user-detail-summary-grid">
        <SummaryCard
          label="Account Status"
          value={user.isActive ? "Active" : "Inactive"}
          hint="Current moderation state"
          tone={statusTone}
        />
        <SummaryCard
          label="Joined At"
          value={formatAdminDate(user.createdAt)}
          hint="Account creation time"
          tone="indigo"
        />
        <SummaryCard
          label="Updated At"
          value={formatAdminDate(user.updatedAt)}
          hint="Last profile update"
          tone="amber"
        />
        <SummaryCard
          label="Role"
          value={String(user.role || "").toUpperCase()}
          hint="Permission role on system"
          tone="slate"
        />
      </div>

      <div className="admin-user-detail-two-col">
        <SectionCard
          title="Account Information"
          subtitle="Core identity and public profile data"
        >
          <div className="admin-user-detail-info-grid">
            <InfoTile icon={User} label="Full Name" value={user.fullName} />
            <InfoTile icon={User} label="Username" value={user.username} />
            <InfoTile icon={Mail} label="Email" value={user.email} />
            <InfoTile icon={Phone} label="Phone" value={user.phone} />
            <InfoTile
              icon={ShieldCheck}
              label="Role"
              value={String(user.role || "").toUpperCase()}
            />
            <InfoTile
              icon={BadgeCheck}
              label="Status"
              value={user.isActive ? "Active" : "Inactive"}
            />
            <div className="admin-user-detail-col-span-2">
              <InfoTile
                icon={AlertTriangle}
                label="Headline"
                value={user.headline}
              />
            </div>
            <div className="admin-user-detail-col-span-2">
              <InfoTile icon={User} label="Bio" value={user.bio} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Admin Activity Summary"
          subtitle="Quick operational view for this account"
        >
          {user.role === "student" ? (
            <div className="admin-user-detail-summary-stack">
              <SummaryCard
                label="Total Enrollments"
                value={formatAdminNumber(summary.totalEnrollments)}
                hint="Courses joined by this student"
                tone="emerald"
              />
              <SummaryCard
                label="In Progress"
                value={formatAdminNumber(summary.inProgressCourses)}
                hint="Currently ongoing learning records"
                tone="indigo"
              />
              <SummaryCard
                label="Completed"
                value={formatAdminNumber(summary.completedCourses)}
                hint="Successfully finished courses"
                tone="amber"
              />
              <SummaryCard
                label="Certificates"
                value={formatAdminNumber(summary.certificatesCount)}
                hint="Earned completion certificates"
                tone="rose"
              />
            </div>
          ) : user.role === "instructor" ? (
            <div className="admin-user-detail-summary-stack">
              <SummaryCard
                label="Total Courses"
                value={formatAdminNumber(summary.totalCourses)}
                hint="Courses created by this instructor"
                tone="indigo"
              />
              <SummaryCard
                label="Published Courses"
                value={formatAdminNumber(summary.publishedCourses)}
                hint="Currently live courses"
                tone="emerald"
              />
              <SummaryCard
                label="Draft Courses"
                value={formatAdminNumber(summary.draftCourses)}
                hint="Courses not published yet"
                tone="amber"
              />
              <SummaryCard
                label="Total Students"
                value={formatAdminNumber(summary.totalStudents)}
                hint="Combined students across courses"
                tone="rose"
              />
            </div>
          ) : (
            <DetailEmptyBlock
              title="Admin account summary"
              description="Admin accounts do not currently expose extended role-specific metrics in this view."
            />
          )}
        </SectionCard>
      </div>

      <div className="admin-user-detail-two-col">
        <SectionCard
          title="Activity Timeline"
          subtitle="Readable operational checkpoints for this account"
        >
          <div className="admin-user-detail-timeline">
            <TimelineItem
              title="Account Created"
              description={`User account was created at ${formatAdminDate(
                user.createdAt
              )}.`}
              tone="indigo"
            />
            <TimelineItem
              title={user.isActive ? "Account Active" : "Account Inactive"}
              description={
                user.isActive
                  ? "This account is currently enabled and can access the platform within its assigned role."
                  : "This account is currently disabled or deactivated and may need review before being restored."
              }
              tone={user.isActive ? "emerald" : "red"}
            />
            <TimelineItem
              title="Profile Updated"
              description={`Latest known profile update was recorded at ${formatAdminDate(
                user.updatedAt
              )}.`}
              tone="amber"
            />
            <TimelineItem
              title="Role Review"
              description={`This account is assigned the role "${user.role}". Review this role if permissions need to change.`}
              tone="slate"
            />
          </div>
        </SectionCard>
      </div>
    </>
  );
}