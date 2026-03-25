export default function AdminStatCard({
  label,
  value,
  subtitle,
  tone = "indigo",
}) {
  return (
    <div className="admin-dashboard-stat-card">
      <div className="admin-dashboard-stat-card__top">
        <div>
          <div className="admin-dashboard-stat-card__label">{label}</div>
          <div className="admin-dashboard-stat-card__value">{value}</div>
          {subtitle ? (
            <div className="admin-dashboard-stat-card__subtitle">
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          className={`admin-dashboard-stat-card__icon admin-dashboard-stat-card__icon--${tone}`}
        />
      </div>
    </div>
  );
}