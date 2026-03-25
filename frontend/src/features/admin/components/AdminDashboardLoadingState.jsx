export default function AdminDashboardLoadingState() {
  return (
    <>
      <div className="admin-dashboard-stats-grid admin-dashboard-stats-grid--loading">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="admin-dashboard-skeleton-card">
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--sm" />
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--md" />
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--xs" />
          </div>
        ))}
      </div>

      <div className="admin-dashboard-section-grid">
        {[1, 2, 3].map((item) => (
          <div key={item} className="admin-dashboard-skeleton-panel">
            <div className="admin-dashboard-skeleton admin-dashboard-skeleton--title" />
            <div className="admin-dashboard-skeleton-list">
              {[1, 2, 3, 4].map((sub) => (
                <div key={sub} className="admin-dashboard-skeleton-row" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}