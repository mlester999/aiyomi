import Link from "next/link";

import {
  formatNumber,
  formatPercentage,
  humanizeKey,
  statusLabel,
} from "@/lib/admin/format";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail?: string;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{typeof value === "number" ? formatNumber(value) : value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

export function DistributionList({
  items,
  emptyLabel,
  showConverted = false,
}: {
  items: ReadonlyArray<{
    key: string;
    count: number;
    percentage: number;
    converted?: number;
    conversion_rate?: number;
  }>;
  emptyLabel: string;
  showConverted?: boolean;
}) {
  if (!items.length || items.every((item) => item.count === 0)) {
    return <EmptyState compact description={emptyLabel} title="No distribution data yet" />;
  }

  return (
    <ul className="distribution-list">
      {items.map((item) => (
        <li key={item.key}>
          <div className="distribution-label">
            <span>{humanizeKey(item.key)}</span>
            <span>
              {formatNumber(item.count)}{" "}
              <small>
                ({formatPercentage(item.percentage)}
                {showConverted && item.converted !== undefined
                  ? `, ${formatNumber(item.converted)} converted${item.conversion_rate !== undefined ? ` at ${formatPercentage(item.conversion_rate)}` : ""}`
                  : ""}
                )
              </small>
            </span>
          </div>
          <div
            aria-label={`${humanizeKey(item.key)}: ${formatNumber(item.count)}, ${formatPercentage(item.percentage)}${showConverted && item.converted !== undefined ? `, ${formatNumber(item.converted)} converted${item.conversion_rate !== undefined ? ` at ${formatPercentage(item.conversion_rate)}` : ""}` : ""}`}
            className="bar-track"
            role="img"
          >
            <span className="bar-fill" style={{ width: `${Math.min(100, item.percentage)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TrendChart({
  items,
}: {
  items: ReadonlyArray<{ date: string; count: number }>;
}) {
  if (!items.length || items.every((item) => item.count === 0)) {
    return (
      <EmptyState
        compact
        description="Waitlist activity will appear here after the first signup."
        title="No signup activity yet"
      />
    );
  }

  const maximum = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="trend-wrap">
      <div aria-label="Daily waitlist signups for the last 30 days" className="trend-chart" role="img">
        {items.map((item) => (
          <span
            className="trend-column"
            key={item.date}
            style={{ height: `${Math.max(4, (item.count / maximum) * 100)}%` }}
            title={`${item.date}: ${item.count}`}
          />
        ))}
      </div>
      <details className="chart-data">
        <summary>View chart data</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th scope="col">Date</th><th scope="col">Signups</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.date}><td>{item.date}</td><td>{formatNumber(item.count)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={`empty-state${compact ? " empty-state-compact" : ""}`}>
      <span aria-hidden="true">○</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

const pageHref = (
  pathname: string,
  searchParams: Record<string, string | undefined>,
  page: number,
) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
};

export function Pagination({
  pathname,
  searchParams,
  page,
  totalPages,
  total,
}: {
  pathname: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  total: number;
}) {
  if (!total) return null;

  return (
    <nav aria-label="Pagination" className="pagination">
      <p>
        Page {page} of {Math.max(1, totalPages)} · {formatNumber(total)} results
      </p>
      <div>
        {page > 1 ? (
          <Link className="button button-secondary" href={pageHref(pathname, searchParams, page - 1)}>
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className="button button-secondary button-disabled">Previous</span>
        )}
        {page < totalPages ? (
          <Link className="button button-secondary" href={pageHref(pathname, searchParams, page + 1)}>
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className="button button-secondary button-disabled">Next</span>
        )}
      </div>
    </nav>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.replaceAll("_", "-");
  return (
    <span className={`badge badge-${normalized}`}>
      <span aria-hidden="true" className="badge-dot" />
      {statusLabel(value)}
    </span>
  );
}
