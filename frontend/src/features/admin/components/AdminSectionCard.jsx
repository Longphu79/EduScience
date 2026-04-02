export default function AdminSectionCard({
  title,
  subtitle,
  action,
  children,
}) {
  return (
    <section className="admin-dashboard-section-card">
      <div className="admin-dashboard-section-card__header">
        <div>
          <h2 className="admin-dashboard-section-card__title">{title}</h2>
          {subtitle ? (
            <p className="admin-dashboard-section-card__subtitle">
              {subtitle}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="admin-dashboard-section-card__action">{action}</div>
        ) : null}
      </div>

      <div className="admin-dashboard-section-card__body">{children}</div>
    </section>
  );
}