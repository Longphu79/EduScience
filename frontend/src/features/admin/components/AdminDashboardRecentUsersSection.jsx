import { Link } from "react-router-dom";
import AdminSectionCard from "./AdminSectionCard";
import AdminEmptyState from "./AdminEmptyState";

export default function AdminDashboardRecentUsersSection({ users = [] }) {
  return (
    <AdminSectionCard
      title="Recent Users"
      subtitle="Latest registered accounts on the system"
      action={
        <Link to="/admin/users" className="admin-dashboard-inline-link">
          View all
        </Link>
      }
    >
      {!users.length ? (
        <AdminEmptyState
          title="No recent users"
          subtitle="User data will appear here when available."
        />
      ) : (
        <div className="admin-dashboard-list">
          {users.map((user) => (
            <div key={user._id} className="admin-dashboard-list-card">
              <div className="admin-dashboard-list-card__content">
                <div className="admin-dashboard-list-card__title">
                  {user.fullName || user.username}
                </div>
                <div className="admin-dashboard-list-card__meta">
                  {user.email || "No email"}
                </div>
                <div className="admin-dashboard-badge-row">
                  <span className="admin-dashboard-badge admin-dashboard-badge--slate">
                    {user.role}
                  </span>
                  <span
                    className={`admin-dashboard-badge ${
                      user.isActive
                        ? "admin-dashboard-badge--emerald"
                        : "admin-dashboard-badge--red"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <Link
                to={`/admin/users/${user._id}`}
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