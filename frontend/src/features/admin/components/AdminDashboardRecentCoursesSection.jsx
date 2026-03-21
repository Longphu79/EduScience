import { Link } from "react-router-dom";
import AdminSectionCard from "./AdminSectionCard";
import AdminEmptyState from "./AdminEmptyState";

export default function AdminDashboardRecentCoursesSection({ courses = [] }) {
  return (
    <AdminSectionCard
      title="Recent Courses"
      subtitle="Newest courses created by instructors"
      action={
        <Link to="/admin/courses" className="admin-dashboard-inline-link">
          View all
        </Link>
      }
    >
      {!courses.length ? (
        <AdminEmptyState
          title="No recent courses"
          subtitle="Course data will appear here when available."
        />
      ) : (
        <div className="admin-dashboard-list">
          {courses.map((course) => (
            <div
              key={course._id}
              className="admin-dashboard-list-card admin-dashboard-list-card--block"
            >
              <div className="admin-dashboard-list-card__row">
                <div className="admin-dashboard-list-card__content">
                  <div className="admin-dashboard-list-card__title">
                    {course.title}
                  </div>
                  <div className="admin-dashboard-list-card__meta">
                    {course.instructorId?.fullName ||
                      course.instructorId?.username ||
                      "Unknown instructor"}
                  </div>
                  <div className="admin-dashboard-badge-row">
                    <span className="admin-dashboard-badge admin-dashboard-badge--slate">
                      {course.category || "General"}
                    </span>
                    <span
                      className={`admin-dashboard-badge ${
                        course.status === "published"
                          ? "admin-dashboard-badge--emerald"
                          : course.status === "archived"
                          ? "admin-dashboard-badge--slate-soft"
                          : "admin-dashboard-badge--amber"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/admin/courses/${course._id}`}
                  className="admin-dashboard-mini-btn"
                >
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminSectionCard>
  );
}