export default function AdminEmptyState({ title, subtitle }) {
  return (
    <div className="admin-dashboard-empty-state">
      <h3 className="admin-dashboard-empty-state__title">{title}</h3>
      {subtitle ? (
        <p className="admin-dashboard-empty-state__subtitle">{subtitle}</p>
      ) : null}
    </div>
  );
}