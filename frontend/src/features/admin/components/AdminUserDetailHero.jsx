import { Link } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import {
  FALLBACK_AVATAR,
  getAdminUserDetailRoleBadgeClass,
  getAdminUserDisplayName,
} from "../utils/admin.helpers";

export default function AdminUserDetailHero({
  user,
  processing = false,
  onRefresh,
  onOpenConfirm,
}) {
  if (!user) return null;

  return (
    <section className="admin-user-detail-hero">
      <div className="admin-user-detail-hero__cover" />
      <div className="admin-user-detail-hero__body">
        <div className="admin-user-detail-hero__inner">
          <div className="admin-user-detail-hero__left">
            <img
              src={user.avatarUrl || FALLBACK_AVATAR}
              alt={getAdminUserDisplayName(user)}
              className="admin-user-detail-hero__avatar"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_AVATAR;
              }}
            />

            <div className="admin-user-detail-hero__content">
              <div className="admin-user-detail-hero__badge">Admin Console</div>

              <h1 className="admin-user-detail-hero__title">
                {getAdminUserDisplayName(user)}
              </h1>

              <div className="admin-user-detail-hero__badge-row">
                <span className={getAdminUserDetailRoleBadgeClass(user.role)}>
                  {user.role}
                </span>
                <span
                  className={`admin-user-detail-badge ${
                    user.isActive
                      ? "admin-user-detail-badge--emerald"
                      : "admin-user-detail-badge--red"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="admin-user-detail-hero__meta">@{user.username}</p>
              <p className="admin-user-detail-hero__meta">
                {user.email || "No email"}
              </p>

              {user.headline ? (
                <p className="admin-user-detail-hero__headline">
                  {user.headline}
                </p>
              ) : null}
            </div>
          </div>

          <div className="admin-user-detail-hero__actions">
            <button
              type="button"
              onClick={onRefresh}
              className="admin-user-detail-ghost-btn admin-user-detail-ghost-btn--icon"
            >
              <RefreshCcw className="admin-user-detail-btn-icon" />
              Refresh
            </button>

            <Link to="/admin/users" className="admin-user-detail-ghost-btn">
              Back to Users
            </Link>

            <Link to={`/users/${user._id}`} className="admin-user-detail-ghost-btn">
              Public Profile
            </Link>

            <button
              type="button"
              onClick={onOpenConfirm}
              disabled={processing}
              className={`admin-user-detail-action-btn ${
                user.isActive
                  ? "admin-user-detail-action-btn--red"
                  : "admin-user-detail-action-btn--emerald"
              }`}
            >
              {processing
                ? "Processing..."
                : user.isActive
                ? "Deactivate User"
                : "Reactivate User"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}