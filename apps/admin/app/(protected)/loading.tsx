export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="page-stack">
      <span className="sr-only">Loading admin data</span>
      <div className="skeleton skeleton-heading" />
      <div className="metric-grid">
        {Array.from({ length: 7 }, (_, index) => (
          <div className="skeleton skeleton-card" key={index} />
        ))}
      </div>
      <div className="skeleton skeleton-chart" />
      <div className="two-column-grid">
        <div className="skeleton skeleton-panel" />
        <div className="skeleton skeleton-panel" />
      </div>
    </div>
  );
}
