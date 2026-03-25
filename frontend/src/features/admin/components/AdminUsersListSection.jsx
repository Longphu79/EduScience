import { Link } from "react-router-dom";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function getRoleBadgeClass(role) {
  if (role === "admin") {
    return "admin-users-badge admin-users-badge--red";
  }
  if (role === "instructor") {
    return "admin-users-badge admin-users-badge--violet";
  }
  return "admin-users-badge admin-users-badge--emerald";
}

export default function AdminUsersListSection({
  loading = false,
  items = [],
  pagination = null,
  page = 1,
  processingId = "",
  onChangePage,
  onOpenToggleDialog,
}) {
  return (
    <section className="admin-users-list-panel">
      <div className="admin-users-list-panel__header">
        <div>
          <h2 className="admin-users-list-panel__title">User List</h2>
          <p className="admin-users-list-panel__subtitle">
            {pagination
              ? `${formatNumber(pagination.totalItems)} users found`
              : "Manage platform users"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-users-skeleton-list">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="admin-users-skeleton-row" />
          ))}
        </div>
      ) : !items.length ? (
        <div className="admin-users-empty-state">
          <h3 className="admin-users-empty-state__title">No users found</h3>
          <p className="admin-users-empty-state__subtitle">
            Try adjusting your filters or search keyword.
          </p>
        </div>
      ) : (
        <div className="admin-users-card-list">
          {items.map((user) => (
            <div key={user._id} className="admin-users-card">
              <div className="admin-users-card__row">
                <div className="admin-users-card__left">
                  <img
                    src={
                      user.avatarUrl ||
                      "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
                    }
                    alt={user.fullName || user.username}
                    className="admin-users-card__avatar"
                  />

                  <div className="admin-users-card__content">
                    <div className="admin-users-card__title-row">
                      <h3 className="admin-users-card__title">
                        {user.fullName || user.username}
                      </h3>

                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </span>

                      <span
                        className={`admin-users-badge ${
                          user.isActive
                            ? "admin-users-badge--emerald"
                            : "admin-users-badge--red"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="admin-users-card__meta">@{user.username}</div>
                    <div className="admin-users-card__meta">
                      {user.email || "No email"}
                    </div>

                    {user.headline ? (
                      <div className="admin-users-card__headline">
                        {user.headline}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="admin-users-card__actions">
                  <Link
                    to={`/users/${user._id}`}
                    className="admin-users-ghost-btn"
                  >
                    Public Profile
                  </Link>

                  <Link
                    to={`/admin/users/${user._id}`}
                    className="admin-users-ghost-btn"
                  >
                    Admin Detail
                  </Link>

                  <button
                    type="button"
                    onClick={() => onOpenToggleDialog?.(user)}
                    disabled={processingId === user._id}
                    className={`admin-users-action-btn ${
                      user.isActive
                        ? "admin-users-action-btn--red"
                        : "admin-users-action-btn--emerald"
                    }`}
                  >
                    {processingId === user._id
                      ? "Processing..."
                      : user.isActive
                      ? "Deactivate"
                      : "Reactivate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="admin-users-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onChangePage?.(page - 1)}
            className="admin-users-pagination__btn"
          >
            Previous
          </button>

          <div className="admin-users-pagination__info">
            Page {page} / {pagination.totalPages}
          </div>

          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => onChangePage?.(page + 1)}
            className="admin-users-pagination__btn"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}