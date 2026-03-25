import { Link } from "react-router-dom";
import {
  formatAdminDate,
  formatAdminNumber,
} from "../utils/admin.helpers";

function DetailEmptyBlock({ title, description }) {
  return (
    <div className="admin-user-detail-empty-block">
      <h3 className="admin-user-detail-empty-block__title">{title}</h3>
      <p className="admin-user-detail-empty-block__description">{description}</p>
    </div>
  );
}

export default function AdminUserRoleRecordsSection({
  user,
  enrollments = [],
  courses = [],
  processing = false,
  onOpenConfirm,
}) {
  if (!user) return null;

  return (
    <>
      <div className="admin-user-detail-two-col">
        <section className="admin-user-detail-section-card">
          <div className="admin-user-detail-section-card__header">
            <div>
              <h2 className="admin-user-detail-section-card__title">
                Moderator Actions
              </h2>
              <p className="admin-user-detail-section-card__subtitle">
                Fast admin actions related to this user
              </p>
            </div>
          </div>

          <div className="admin-user-detail-section-card__body">
            <div className="admin-user-detail-action-stack">
              <Link
                to={`/users/${user._id}`}
                className="admin-user-detail-ghost-btn admin-user-detail-ghost-btn--full"
              >
                View Public Profile
              </Link>

              <button
                type="button"
                onClick={onOpenConfirm}
                disabled={processing}
                className={`admin-user-detail-action-btn admin-user-detail-action-btn--full ${
                  user.isActive
                    ? "admin-user-detail-action-btn--red"
                    : "admin-user-detail-action-btn--emerald"
                }`}
              >
                {processing
                  ? "Processing..."
                  : user.isActive
                  ? "Deactivate Account"
                  : "Reactivate Account"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {user.role === "student" ? (
        <section className="admin-user-detail-section-card">
          <div className="admin-user-detail-section-card__header">
            <div>
              <h2 className="admin-user-detail-section-card__title">
                Student Enrollments
              </h2>
              <p className="admin-user-detail-section-card__subtitle">
                Courses this student has joined
              </p>
            </div>
          </div>

          <div className="admin-user-detail-section-card__body">
            {!enrollments.length ? (
              <DetailEmptyBlock
                title="No enrollments found"
                description="This student has not enrolled in any course yet."
              />
            ) : (
              <div className="admin-user-detail-card-list">
                {enrollments.map((item) => (
                  <div key={item._id} className="admin-user-detail-item-card">
                    <div className="admin-user-detail-item-card__row">
                      <div>
                        <h3 className="admin-user-detail-item-card__title">
                          {item.courseId?.title || "Untitled course"}
                        </h3>
                        <p className="admin-user-detail-item-card__meta">
                          Progress: {item.progress || 0}% • Enrolled:{" "}
                          {formatAdminDate(item.enrolledAt || item.createdAt)}
                        </p>

                        <div className="admin-user-detail-item-card__badge-row">
                          <span
                            className={`admin-user-detail-badge ${
                              item.completed
                                ? "admin-user-detail-badge--emerald"
                                : "admin-user-detail-badge--amber"
                            }`}
                          >
                            {item.completed ? "Completed" : "In Progress"}
                          </span>
                        </div>
                      </div>

                      {item.courseId?._id ? (
                        <div className="admin-user-detail-item-card__actions">
                          <Link
                            to={`/courses/${item.courseId._id}`}
                            className="admin-user-detail-ghost-btn"
                          >
                            View Course
                          </Link>
                          <Link
                            to={`/admin/courses/${item.courseId._id}`}
                            className="admin-user-detail-ghost-btn"
                          >
                            Admin Course
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {user.role === "instructor" ? (
        <section className="admin-user-detail-section-card">
          <div className="admin-user-detail-section-card__header">
            <div>
              <h2 className="admin-user-detail-section-card__title">
                Instructor Courses
              </h2>
              <p className="admin-user-detail-section-card__subtitle">
                Courses created by this instructor
              </p>
            </div>
          </div>

          <div className="admin-user-detail-section-card__body">
            {!courses.length ? (
              <DetailEmptyBlock
                title="No courses found"
                description="This instructor has not created any course yet."
              />
            ) : (
              <div className="admin-user-detail-card-list">
                {courses.map((course) => (
                  <div key={course._id} className="admin-user-detail-item-card">
                    <div className="admin-user-detail-item-card__row">
                      <div>
                        <h3 className="admin-user-detail-item-card__title">
                          {course.title}
                        </h3>
                        <p className="admin-user-detail-item-card__meta">
                          {course.category || "General"} • {course.level || "N/A"} •{" "}
                          {formatAdminNumber(course.totalEnrollments)} enrollments
                        </p>
                      </div>

                      <div className="admin-user-detail-item-card__actions">
                        <Link
                          to={`/courses/${course._id}`}
                          className="admin-user-detail-ghost-btn"
                        >
                          Public View
                        </Link>
                        <Link
                          to={`/admin/courses/${course._id}`}
                          className="admin-user-detail-ghost-btn"
                        >
                          Admin Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}