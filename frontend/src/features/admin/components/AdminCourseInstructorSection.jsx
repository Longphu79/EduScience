import { Link } from "react-router-dom";
import AdminEmptyBlock from "./AdminEmptyBlock";
import {
  FALLBACK_AVATAR,
  getAdminUserDisplayName,
} from "../utils/admin.helpers";

export default function AdminCourseInstructorSection({ course }) {
  const instructor = course?.instructorId || null;

  return (
    <section className="admin-course-detail-section-card">
      <div className="admin-course-detail-section-card__header">
        <div>
          <h2 className="admin-course-detail-section-card__title">
            Instructor Information
          </h2>
          <p className="admin-course-detail-section-card__subtitle">
            Owner of this course
          </p>
        </div>
      </div>

      <div className="admin-course-detail-section-card__body">
        {!instructor ? (
          <AdminEmptyBlock
            title="No instructor found"
            description="This course currently has no attached instructor data."
          />
        ) : (
          <div className="admin-course-detail-instructor-card">
            <div className="admin-course-detail-instructor-card__left">
              <img
                src={instructor.avatarUrl || FALLBACK_AVATAR}
                alt={getAdminUserDisplayName(instructor)}
                className="admin-course-detail-instructor-card__avatar"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_AVATAR;
                }}
              />

              <div className="admin-course-detail-instructor-card__content">
                <div className="admin-course-detail-instructor-card__name">
                  {getAdminUserDisplayName(instructor)}
                </div>
                <div className="admin-course-detail-instructor-card__email">
                  {instructor.email || "No email"}
                </div>
                <div className="admin-course-detail-instructor-card__badge-row">
                  <span
                    className={`admin-course-detail-badge ${
                      instructor.isActive
                        ? "admin-course-detail-badge--emerald"
                        : "admin-course-detail-badge--red"
                    }`}
                  >
                    {instructor.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-course-detail-instructor-card__actions">
              <Link
                to={`/users/${instructor._id}`}
                className="admin-course-detail-ghost-btn"
              >
                Public Profile
              </Link>

              <Link
                to={`/admin/users/${instructor._id}`}
                className="admin-course-detail-ghost-btn"
              >
                Admin User Detail
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}