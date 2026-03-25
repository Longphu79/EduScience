import {
  BookOpen,
  CalendarDays,
  ShieldCheck,
  FileText,
  Layers3,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatAdminDate,
  formatAdminNumber,
} from "../utils/admin.helpers";

function SummaryCard({ label, value, tone = "slate", hint }) {
  return (
    <div className="admin-course-detail-summary-card">
      <div className="admin-course-detail-summary-card__top">
        <div>
          <div className="admin-course-detail-summary-card__label">{label}</div>
          <div className="admin-course-detail-summary-card__value">{value}</div>
          {hint ? (
            <div className="admin-course-detail-summary-card__hint">{hint}</div>
          ) : null}
        </div>
        <div
          className={`admin-course-detail-summary-card__icon admin-course-detail-summary-card__icon--${tone}`}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="admin-course-detail-section-card">
      <div className="admin-course-detail-section-card__header">
        <div>
          <h2 className="admin-course-detail-section-card__title">{title}</h2>
          {subtitle ? (
            <p className="admin-course-detail-section-card__subtitle">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="admin-course-detail-section-card__body">{children}</div>
    </section>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="admin-course-detail-info-tile">
      <div className="admin-course-detail-info-tile__label-wrap">
        {Icon ? <Icon className="admin-course-detail-info-tile__icon" /> : null}
        <div className="admin-course-detail-info-tile__label">{label}</div>
      </div>
      <div className="admin-course-detail-info-tile__value">{value || "N/A"}</div>
    </div>
  );
}

function TimelineItem({ title, description, tone = "slate" }) {
  return (
    <div className="admin-course-detail-timeline-item">
      <div className="admin-course-detail-timeline-item__dot" />
      <div
        className={`admin-course-detail-timeline-item__title admin-course-detail-timeline-item__title--${tone}`}
      >
        {title}
      </div>
      <div className="admin-course-detail-timeline-item__description">
        {description}
      </div>
    </div>
  );
}

export default function AdminCourseDetailContent({
  course,
  summary = {},
  statusMeta,
  processingStatus = false,
  onOpenStatusDialog,
}) {
  if (!course) return null;

  return (
    <>
      <div className="admin-course-detail-summary-grid">
        <SummaryCard
          label="Price"
          value={
            course.isFree
              ? "Free"
              : `${formatAdminNumber(course.salePrice ?? course.price)} đ`
          }
          hint="Displayed commerce price"
          tone="emerald"
        />
        <SummaryCard
          label="Enrollments"
          value={formatAdminNumber(
            summary.enrollmentsCount || course.totalEnrollments
          )}
          hint="Current learning demand"
          tone="indigo"
        />
        <SummaryCard
          label="Rating"
          value={`${course.rating || 0}/5`}
          hint={`${formatAdminNumber(course.totalReviews)} reviews`}
          tone="amber"
        />
        <SummaryCard
          label="Lessons"
          value={formatAdminNumber(course.totalLessons)}
          hint="Structured learning units"
          tone="rose"
        />
      </div>

      <div className="admin-course-detail-two-col">
        <SectionCard
          title="Course Information"
          subtitle="Main course metadata and content overview"
        >
          <div className="admin-course-detail-info-grid">
            <InfoTile icon={BookOpen} label="Title" value={course.title} />
            <InfoTile icon={ShieldCheck} label="Slug" value={course.slug} />
            <InfoTile icon={Layers3} label="Category" value={course.category} />
            <InfoTile
              icon={GraduationCap}
              label="Language"
              value={course.language}
            />
            <InfoTile icon={GraduationCap} label="Level" value={course.level} />
            <InfoTile
              icon={CalendarDays}
              label="Duration"
              value={`${formatAdminNumber(course.duration)} minutes`}
            />
            <div className="admin-course-detail-col-span-2">
              <InfoTile
                icon={FileText}
                label="Short Description"
                value={course.shortDescription}
              />
            </div>
            <div className="admin-course-detail-col-span-2">
              <InfoTile
                icon={FileText}
                label="Full Description"
                value={course.description}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Publishing Summary"
          subtitle="Lifecycle and moderation state"
        >
          <div className="admin-course-detail-summary-stack">
            <SummaryCard
              label="Current Status"
              value={course.status || "N/A"}
              hint="Current publishing lifecycle state"
              tone={statusMeta?.tone || "amber"}
            />
            <SummaryCard
              label="Created At"
              value={formatAdminDate(course.createdAt)}
              hint="Initial course creation timestamp"
              tone="amber"
            />
            <SummaryCard
              label="Updated At"
              value={formatAdminDate(course.updatedAt)}
              hint="Most recent course update"
              tone="slate"
            />
            <SummaryCard
              label="Reviews"
              value={formatAdminNumber(course.totalReviews)}
              hint="Review count attached to this course"
              tone="indigo"
            />
          </div>
        </SectionCard>
      </div>

      <div className="admin-course-detail-two-col">
        <SectionCard
          title="Course Timeline"
          subtitle="Readable operational checkpoints"
        >
          <div className="admin-course-detail-timeline">
            <TimelineItem
              title="Course Created"
              description={`Course record was created at ${formatAdminDate(
                course.createdAt
              )}.`}
              tone="indigo"
            />
            <TimelineItem
              title={`Status: ${statusMeta?.label || "Draft"}`}
              description={
                course.status === "published"
                  ? "This course is currently visible as a live learning product."
                  : course.status === "archived"
                  ? "This course is archived and no longer intended for active promotion."
                  : "This course is currently in draft state and may need editing before publication."
              }
              tone={statusMeta?.tone || "amber"}
            />
            <TimelineItem
              title="Last Updated"
              description={`Latest course update was recorded at ${formatAdminDate(
                course.updatedAt
              )}.`}
              tone="amber"
            />
            <TimelineItem
              title="Engagement Snapshot"
              description={`This course currently has ${formatAdminNumber(
                summary.enrollmentsCount || course.totalEnrollments
              )} enrollments and ${formatAdminNumber(
                course.totalReviews
              )} reviews.`}
              tone="slate"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Moderator Actions"
          subtitle="Fast admin actions for this course"
        >
          <div className="admin-course-detail-action-stack">
            <Link
              to={`/courses/${course._id}`}
              className="admin-course-detail-ghost-btn admin-course-detail-ghost-btn--full"
            >
              Open Public Course
            </Link>

            {course.instructorId?._id ? (
              <Link
                to={`/admin/users/${course.instructorId._id}`}
                className="admin-course-detail-ghost-btn admin-course-detail-ghost-btn--full"
              >
                Review Instructor Account
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => onOpenStatusDialog?.("published")}
              disabled={processingStatus}
              className="admin-course-detail-action-btn admin-course-detail-action-btn--emerald admin-course-detail-action-btn--full"
            >
              Publish Course
            </button>

            <button
              type="button"
              onClick={() => onOpenStatusDialog?.("draft")}
              disabled={processingStatus}
              className="admin-course-detail-action-btn admin-course-detail-action-btn--amber admin-course-detail-action-btn--full"
            >
              Move to Draft
            </button>

            <button
              type="button"
              onClick={() => onOpenStatusDialog?.("archived")}
              disabled={processingStatus}
              className="admin-course-detail-action-btn admin-course-detail-action-btn--slate admin-course-detail-action-btn--full"
            >
              {processingStatus ? "Processing..." : "Archive Course"}
            </button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}