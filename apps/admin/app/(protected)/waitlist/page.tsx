import type { Metadata } from "next";
import Link from "next/link";

import {
  EmptyState,
  PageHeader,
  Pagination,
  StatusBadge,
} from "@/components/admin-ui";
import { CsvExportForm } from "@/components/csv-export-form";
import { hasPermission, type AdminMember } from "@/lib/admin/contracts";
import { getWaitlistData } from "@/lib/admin/data";
import { formatDateTime, humanizeKey } from "@/lib/admin/format";
import {
  parseWaitlistFilters,
  platformValues,
  sourceValues,
  waitlistStatusValues,
  type WaitlistFilters,
} from "@/lib/admin/schemas";
import { requireAdminPermission } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Waitlist" };

interface WaitlistPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function FilterFields({
  filters,
  member,
}: {
  filters: WaitlistFilters;
  member: Pick<AdminMember, "role">;
}) {
  return (
    <>
      <label className="field-wide">
        <span>
          {member.role === "support"
            ? "Search email or name"
            : "Search email, name, or referral code"}
        </span>
        <input defaultValue={filters.query} name="query" placeholder="Search leads" type="search" />
      </label>
      <label>
        <span>Status</span>
        <select defaultValue={filters.status ?? ""} name="status">
          <option value="">All statuses</option>
          {waitlistStatusValues.map((status) => (
            <option key={status} value={status}>
              {status === "pending" ? "Waiting" : status === "converted" ? "Joined" : humanizeKey(status)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Platform</span>
        <select defaultValue={filters.platform ?? ""} name="platform">
          <option value="">All platforms</option>
          {platformValues.map((platform) => <option key={platform} value={platform}>{humanizeKey(platform)}</option>)}
        </select>
      </label>
      <label>
        <span>Source</span>
        <select defaultValue={filters.source ?? ""} name="source">
          <option value="">All sources</option>
          {sourceValues.map((source) => <option key={source} value={source}>{humanizeKey(source)}</option>)}
        </select>
      </label>
      {member.role !== "support" && (
        <label>
          <span>Campaign</span>
          <input defaultValue={filters.campaign} name="campaign" placeholder="Exact campaign" />
        </label>
      )}
      <label>
        <span>Email confirmation</span>
        <select defaultValue={filters.emailStatus ?? ""} name="emailStatus">
          <option value="">Any status</option>
          <option value="sent">Send accepted</option>
          <option value="not_sent">Not sent</option>
        </select>
      </label>
      <label>
        <span>Conversion</span>
        <select defaultValue={filters.converted === undefined ? "" : String(filters.converted)} name="converted">
          <option value="">Any conversion state</option>
          <option value="true">Converted</option>
          <option value="false">Not converted</option>
        </select>
      </label>
      <label>
        <span>Joined from</span>
        <input defaultValue={filters.dateFrom} name="dateFrom" type="date" />
      </label>
      <label>
        <span>Joined through</span>
        <input defaultValue={filters.dateTo} name="dateTo" type="date" />
      </label>
      <label>
        <span>Sort</span>
        <select defaultValue={filters.sort} name="sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="email">Email</option>
          <option value="status">Status</option>
          <option value="source">Source</option>
        </select>
      </label>
      <label>
        <span>Rows</span>
        <select defaultValue={String(filters.pageSize)} name="pageSize">
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>
    </>
  );
}

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const rawParams = await searchParams;
  const parsedFilters = parseWaitlistFilters(rawParams);
  const member = await requireAdminPermission("waitlist.read");
  const filters =
    member.role === "support"
      ? { ...parsedFilters, campaign: undefined }
      : parsedFilters;
  const data = await getWaitlistData(filters);
  const params = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [key, firstValue(value)]),
  );
  const activeFilterCount = [
    filters.query,
    filters.status,
    filters.platform,
    filters.source,
    filters.campaign,
    filters.emailStatus,
    filters.converted,
    filters.dateFrom,
    filters.dateTo,
  ].filter((value) => value !== undefined).length;

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          hasPermission(member, "waitlist.export") ? (
            <CsvExportForm params={params} />
          ) : undefined
        }
        description="Search, review, and manage accepted waitlist records."
        eyebrow="Growth"
        title="Waitlist"
      />

      {rawParams.error === "operation" && (
        <p className="notice notice-error" role="alert">
          That operation could not be completed. No changes were made.
        </p>
      )}

      <section className="filter-panel" aria-labelledby="filter-title">
        <div className="filter-heading">
          <div>
            <h2 id="filter-title">Find leads</h2>
            <p>{activeFilterCount ? `${activeFilterCount} active filters` : "No active filters"}</p>
          </div>
          {activeFilterCount > 0 && <Link className="text-link" href="/waitlist">Reset filters</Link>}
        </div>
        <form className="filter-grid desktop-filter-form" method="get">
          <FilterFields filters={filters} member={member} />
          <div className="filter-actions">
            <button className="button button-primary" type="submit">Apply filters</button>
          </div>
        </form>
        <div className="mobile-filter-tools">
          <form className="mobile-search-form" method="get">
            <label>
              <span>Search leads</span>
              <input defaultValue={filters.query} name="query" placeholder="Search leads" type="search" />
            </label>
            <button className="button button-secondary" type="submit">Search</button>
          </form>
          <details className="mobile-filter-sheet">
            <summary className="filter-sheet-trigger">
              <span>Filters</span>
              <span className="badge badge-neutral">{activeFilterCount}</span>
            </summary>
            <form className="mobile-filter-form" method="get">
              <FilterFields filters={filters} member={member} />
              <button className="button button-primary" type="submit">Apply filters</button>
            </form>
          </details>
        </div>
      </section>

      <section className="table-panel" aria-labelledby="results-title">
        <div className="table-panel-heading">
          <div>
            <h2 id="results-title">Leads</h2>
            <p aria-live="polite">{data.total} matching records</p>
          </div>
        </div>
        {data.items.length ? (
          <>
          <div className="table-scroll desktop-data-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Lead</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Status</th>
                  <th className="column-optional" scope="col">Source</th>
                  {member.role !== "support" && (
                    <th className="column-optional" scope="col">Campaign</th>
                  )}
                  <th scope="col">Email</th>
                  <th scope="col">Joined</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong className="table-primary">{lead.email}</strong>
                      <small>{lead.first_name ?? "Name not provided"}</small>
                    </td>
                    <td>{humanizeKey(lead.platform_interest)}</td>
                    <td><StatusBadge value={lead.status} /></td>
                    <td className="column-optional">{humanizeKey(lead.source)}</td>
                    {member.role !== "support" && (
                      <td className="column-optional">{lead.utm_campaign ?? "None"}</td>
                    )}
                    <td>
                      <span className={`badge badge-${lead.email_status}`}>
                        <span aria-hidden="true" className="badge-dot" />
                        {lead.email_status === "sent" ? "Send accepted" : "Not sent"}
                      </span>
                    </td>
                    <td><time dateTime={lead.created_at}>{formatDateTime(lead.created_at)}</time></td>
                    <td><Link className="text-link" href={`/waitlist/${lead.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-record-list">
            {data.items.map((lead) => (
              <article className="mobile-record-card" key={lead.id}>
                <div className="mobile-record-card-heading">
                  <div>
                    <strong>{lead.email}</strong>
                    <span>{lead.first_name ?? "Name not provided"}</span>
                  </div>
                  <StatusBadge value={lead.status} />
                </div>
                <div className="mobile-record-meta">
                  <span>{humanizeKey(lead.platform_interest)}</span>
                  <span>{humanizeKey(lead.source)}</span>
                  <time dateTime={lead.created_at}>{formatDateTime(lead.created_at)}</time>
                </div>
                <div className="mobile-record-card-footer">
                  <span className={`badge badge-${lead.email_status}`}>
                    <span aria-hidden="true" className="badge-dot" />
                    {lead.email_status === "sent" ? "Send accepted" : "Not sent"}
                  </span>
                  <Link className="button button-secondary button-small" href={`/waitlist/${lead.id}`}>View lead</Link>
                </div>
              </article>
            ))}
          </div>
          </>
        ) : (
          <EmptyState
            description={activeFilterCount ? "Adjust or reset the current filters." : "Accepted waitlist signups will appear here."}
            title={activeFilterCount ? "No matching leads" : "No waitlist leads yet"}
          />
        )}
        <Pagination
          page={data.page}
          pathname="/waitlist"
          searchParams={params}
          total={data.total}
          totalPages={data.totalPages}
        />
      </section>
    </div>
  );
}
