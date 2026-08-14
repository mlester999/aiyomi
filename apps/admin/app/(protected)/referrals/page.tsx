import type { Metadata } from "next";
import Link from "next/link";

import {
  EmptyState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "@/components/admin-ui";
import { hasPermission } from "@/lib/admin/contracts";
import { getReferralData } from "@/lib/admin/data";
import { formatDate, formatPercentage } from "@/lib/admin/format";
import { requireAdminPermission } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Referrals" };

interface ReferralsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const safeDate = (value: string | string[] | undefined) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : undefined;
};

export default async function ReferralsPage({ searchParams }: ReferralsPageProps) {
  const params = await searchParams;
  const dateFrom = safeDate(params.dateFrom);
  const dateTo = safeDate(params.dateTo);
  const [member, data] = await Promise.all([
    requireAdminPermission("referrals.read"),
    getReferralData(dateFrom, dateTo),
  ]);

  return (
    <div className="page-stack">
      <PageHeader
        description="Real waitlist referral activity, with no rewards or payout assumptions."
        eyebrow="Growth"
        title="Referrals"
      />

      <form className="date-filter" method="get">
        <label><span>From</span><input defaultValue={dateFrom} name="dateFrom" type="date" /></label>
        <label><span>Through</span><input defaultValue={dateTo} name="dateTo" type="date" /></label>
        <button className="button button-secondary" type="submit">Apply dates</button>
      </form>

      <section aria-label="Referral summary" className="metric-grid">
        <MetricCard label="Referred signups" value={data.metrics.total_referred} />
        <MetricCard label="Share of signups" value={formatPercentage(data.metrics.referral_share)} />
        <MetricCard label="Active referrers" value={data.metrics.active_referrers} />
        <MetricCard label="Converted referrals" value={data.metrics.converted_referrals} />
      </section>

      <section className="table-panel" aria-labelledby="referrers-title">
        <div className="table-panel-heading">
          <div><h2 id="referrers-title">Top referral codes</h2><p>Ranked by accepted referred signups.</p></div>
        </div>
        {data.top_referrers.length ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th scope="col">Referrer</th><th scope="col">Code</th><th scope="col">Referrals</th><th scope="col">Converted</th><th scope="col">Joined</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {data.top_referrers.map((referrer) => (
                  <tr key={referrer.id}>
                    <td>
                      {hasPermission(member, "waitlist.read") ? <Link className="text-link" href={`/waitlist/${referrer.id}`}>{referrer.label}</Link> : referrer.label}
                    </td>
                    <td><code>{referrer.referral_code}</code></td>
                    <td>{referrer.referrals}</td>
                    <td>{referrer.converted_referrals}</td>
                    <td>{formatDate(referrer.created_at)}</td>
                    <td><StatusBadge value={referrer.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState description="Referral activity will appear when a valid referral code brings in a signup." title="No referrals yet" />
        )}
      </section>
    </div>
  );
}
