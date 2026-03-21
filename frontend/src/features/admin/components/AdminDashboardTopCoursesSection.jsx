import { Link } from "react-router-dom";
import AdminSectionCard from "./AdminSectionCard";
import AdminEmptyState from "./AdminEmptyState";
import { formatAdminNumber } from "../utils/admin.helpers";

export default function AdminDashboardTopCoursesSection({ courses = [] }) {
  return (
    <AdminSectionCard
      title="Top Courses"
      subtitle="Courses with strongest enrollment performance"
      action={
        <Link to="/admin/courses" className="admin-dashboard-inline-link">
          View all
        </Link>
      }
    >
      {!courses.length ? (
        <AdminEmptyState
          title="No top courses"
          subtitle="Top courses will appear when enrollments exist."
        />
      ) : (
        <div className="admin-dashboard-list">
          {courses.map((course, index) => (
            <div key={course._id} className="admin-dashboard-list-card">
              <div className="admin-dashboard-top-course">
                <div className="admin-dashboard-top-course__rank">
                  #{index + 1}
                </div>

                <div className="admin-dashboard-list-card__content">
                  <div className="admin-dashboard-list-card__title">
                    {course.title}
                  </div>
                  <div className="admin-dashboard-list-card__meta">
                    {formatAdminNumber(course.totalEnrollments)} enrollments
                    {" • "}
                    {course.rating || 0}/5 rating
                  </div>
                </div>
              </div>

              <Link
                to={`/admin/courses/${course._id}`}
                className="admin-dashboard-mini-btn"
              >
                Detail
              </Link>
            </div>
          ))}
        </div>
      )}
    </AdminSectionCard>
  );
}