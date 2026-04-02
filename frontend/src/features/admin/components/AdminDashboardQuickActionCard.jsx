import { Link } from "react-router-dom";

export default function AdminDashboardQuickActionCard({
  title,
  description,
  to,
  tone = "slate",
}) {
  return (
    <Link to={to} className="admin-dashboard-quick-card">
      <div className="admin-dashboard-quick-card__top">
        <div>
          <div className="admin-dashboard-quick-card__eyebrow">
            Quick action
          </div>

          <h3 className="admin-dashboard-quick-card__title">{title}</h3>

          <p className="admin-dashboard-quick-card__description">
            {description || "Open this workspace and manage the related admin flow."}
          </p>
        </div>

        <div
          className={`admin-dashboard-quick-card__icon admin-dashboard-quick-card__icon--${tone}`}
        />
      </div>

      <div className="admin-dashboard-quick-card__cta">
        <span>Open</span>
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
}