import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, PageHeader, Pagination, StatusBadge } from "@/components/admin-ui";
import { getAuditData } from "@/lib/admin/data";
import { formatDateTime, humanizeKey } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Audit logs" };

interface AuditPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const safeText = (value: string | undefined, pattern: RegExp, maximum: number) =>
  value && value.length <= maximum && pattern.test(value) ? value : undefined;

export default async function AuditLogsPage({ searchParams }: AuditPageProps) {
  const rawParams = await searchParams;
  const params = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [key, firstValue(value)]),
  );
  const pageValue = Number.parseInt(params.page ?? "1", 10);
  const filters = {
    actor: safeText(params.actor, /^[0-9a-f-]{36}$/i, 36),
    action: safeText(params.action, /^[a-z][a-z0-9_.]*$/, 100),
    targetType: safeText(params.targetType, /^[a-z][a-z0-9_]*$/, 60),
    dateFrom: safeText(params.dateFrom, /^\d{4}-\d{2}-\d{2}$/, 10),
    dateTo: safeText(params.dateTo, /^\d{4}-\d{2}-\d{2}$/, 10),
    page: Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1,
    pageSize: 25,
  };
  const data = await getAuditData(filters);
  const hasFilters = Boolean(
    filters.actor || filters.action || filters.targetType || filters.dateFrom || filters.dateTo,
  );

  return (
    <div className="page-stack">
      <PageHeader
        description="An append-only history of privileged changes and exports."
        eyebrow="Operations"
        title="Audit logs"
      />

      <section className="filter-panel" aria-labelledby="audit-filter-title">
        <div className="filter-heading">
          <div><h2 id="audit-filter-title">Filter events</h2><p>{hasFilters ? "Filters are active" : "Showing all events"}</p></div>
          {hasFilters && <Link className="text-link" href="/audit-logs">Reset filters</Link>}
        </div>
        <form className="filter-grid" method="get">
          <label className="field-wide"><span>Actor member UUID</span><input defaultValue={filters.actor} name="actor" placeholder="00000000-0000-0000-0000-000000000000" /></label>
          <label><span>Action</span><input defaultValue={filters.action} name="action" placeholder="waitlist.status_changed" /></label>
          <label><span>Target type</span><input defaultValue={filters.targetType} name="targetType" placeholder="waitlist_signup" /></label>
          <label><span>From</span><input defaultValue={filters.dateFrom} name="dateFrom" type="date" /></label>
          <label><span>Through</span><input defaultValue={filters.dateTo} name="dateTo" type="date" /></label>
          <div className="filter-actions"><button className="button button-primary" type="submit">Apply filters</button></div>
        </form>
      </section>

      <section className="table-panel" aria-labelledby="events-title">
        <div className="table-panel-heading"><div><h2 id="events-title">Events</h2><p>{data.total} matching events</p></div></div>
        {data.items.length ? (
          <>
          <div className="table-scroll desktop-data-table">
            <table>
              <thead><tr><th scope="col">Time</th><th scope="col">Actor</th><th scope="col">Action</th><th scope="col">Target</th><th scope="col">Details</th><th scope="col">Request ID</th></tr></thead>
              <tbody>
                {data.items.map((event) => (
                  <tr key={event.id}>
                    <td><time dateTime={event.created_at}>{formatDateTime(event.created_at)}</time></td>
                    <td><strong className="table-primary">{event.actor_display_name ?? event.actor_email ?? "Former admin"}</strong>{event.actor_role && <StatusBadge value={event.actor_role} />}</td>
                    <td><code>{event.action}</code></td>
                    <td><span>{humanizeKey(event.target_type)}</span><small>{event.target_id ?? "No target ID"}</small></td>
                    <td><code className="metadata-code">{JSON.stringify(event.metadata)}</code></td>
                    <td><code>{event.request_id ?? "Not recorded"}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-record-list">
            {data.items.map((event) => (
              <article className="mobile-record-card" key={event.id}>
                <div className="mobile-record-card-heading">
                  <div>
                    <strong>{humanizeKey(event.action)}</strong>
                    <span>{event.actor_display_name ?? event.actor_email ?? "Former admin"}</span>
                  </div>
                  {event.actor_role && <StatusBadge value={event.actor_role} />}
                </div>
                <div className="mobile-record-meta">
                  <span>{humanizeKey(event.target_type)}</span>
                  <time dateTime={event.created_at}>{formatDateTime(event.created_at)}</time>
                </div>
                <details className="mobile-record-details">
                  <summary>View event details</summary>
                  <dl className="detail-list">
                    <div><dt>Target ID</dt><dd>{event.target_id ?? "Not recorded"}</dd></div>
                    <div><dt>Request ID</dt><dd>{event.request_id ?? "Not recorded"}</dd></div>
                    <div><dt>Metadata</dt><dd><code className="metadata-code">{JSON.stringify(event.metadata)}</code></dd></div>
                  </dl>
                </details>
              </article>
            ))}
          </div>
          </>
        ) : (
          <EmptyState description={hasFilters ? "Adjust or reset the current filters." : "Privileged changes will be recorded here."} title={hasFilters ? "No matching events" : "No audit events yet"} />
        )}
        <Pagination page={data.page} pathname="/audit-logs" searchParams={params} total={data.total} totalPages={data.totalPages} />
      </section>
    </div>
  );
}
