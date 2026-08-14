import type { Metadata } from "next";
import Link from "next/link";

import {
  DistributionList,
  MetricCard,
  PageHeader,
  TrendChart,
} from "@/components/admin-ui";
import { hasPermission } from "@/lib/admin/contracts";
import { getDashboardData } from "@/lib/admin/data";
import { requireAdminPermission } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [member, data] = await Promise.all([
    requireAdminPermission("dashboard.read"),
    getDashboardData(),
  ]);
  const metrics = data.metrics;

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <>
            {hasPermission(member, "waitlist.read") && (
              <Link className="button button-primary" href="/waitlist">
                Open waitlist
              </Link>
            )}
            <Link className="button button-secondary" href="/analytics">
              View analytics
            </Link>
          </>
        }
        description="A current view of waitlist growth, acquisition, and conversion."
        eyebrow="Overview"
        title="Dashboard"
      />

      <section aria-label="Waitlist summary" className="metric-grid">
        <MetricCard label="Total waitlist leads" value={metrics.total_leads} />
        <MetricCard label="Joined today" value={metrics.joined_today} />
        <MetricCard label="Joined last 7 days" value={metrics.joined_7_days} />
        <MetricCard label="Joined last 30 days" value={metrics.joined_30_days} />
        <MetricCard
          detail="Delivery is not tracked"
          label="Confirmation send accepted"
          value={metrics.confirmation_sent}
        />
        <MetricCard label="Referral signups" value={metrics.referral_signups} />
        <MetricCard
          detail="Based on stored conversion fields"
          label="Converted users"
          value={metrics.converted_users}
        />
      </section>

      <section className="panel panel-wide" aria-labelledby="trend-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Last 30 days</span>
            <h2 id="trend-title">Waitlist signups</h2>
          </div>
          <p>Daily accepted waitlist records.</p>
        </div>
        <TrendChart items={data.daily_signups} />
      </section>

      <div className="two-column-grid">
        <section className="panel" aria-labelledby="platform-title">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Audience</span>
              <h2 id="platform-title">Platform interest</h2>
            </div>
          </div>
          <DistributionList
            emptyLabel="Platform choices will appear with waitlist leads."
            items={data.platform_distribution}
          />
        </section>

        <section className="panel" aria-labelledby="source-title">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Acquisition</span>
              <h2 id="source-title">Signup sources</h2>
            </div>
          </div>
          <DistributionList
            emptyLabel="Source attribution will appear with waitlist leads."
            items={data.source_distribution}
          />
        </section>
      </div>
    </div>
  );
}
