import type { Metadata } from "next";

import {
  DistributionList,
  MetricCard,
  PageHeader,
  TrendChart,
} from "@/components/admin-ui";
import { getAnalyticsData } from "@/lib/admin/data";
import { formatPercentage } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Analytics" };

interface AnalyticsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const safeDate = (value: string | string[] | undefined) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? normalized
    : undefined;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const dateFrom = safeDate(params.dateFrom);
  const dateTo = safeDate(params.dateTo);
  const data = await getAnalyticsData(dateFrom, dateTo);

  return (
    <div className="page-stack">
      <PageHeader
        description="Acquisition, audience, engagement, and stored conversion reporting."
        eyebrow="Growth"
        title="Waitlist analytics"
      />

      <form className="date-filter" method="get">
        <label>
          <span>From</span>
          <input defaultValue={dateFrom} name="dateFrom" type="date" />
        </label>
        <label>
          <span>Through</span>
          <input defaultValue={dateTo} name="dateTo" type="date" />
        </label>
        <button className="button button-secondary" type="submit">Apply dates</button>
      </form>

      <section aria-label="Analytics summary" className="metric-grid metric-grid-five">
        <MetricCard label="Total leads" value={data.summary.total_leads} />
        <MetricCard label="Converted users" value={data.summary.converted_users} />
        <MetricCard label="Conversion rate" value={formatPercentage(data.summary.conversion_rate)} />
        <MetricCard
          detail="Delivery is unknown"
          label="Confirmation send accepted"
          value={data.summary.confirmation_sent}
        />
        <MetricCard label="Referred signups" value={data.summary.referred_signups} />
      </section>

      <section className="panel panel-wide" aria-labelledby="analytics-trend-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Acquisition</span>
            <h2 id="analytics-trend-title">Signup growth</h2>
          </div>
          <p>Daily records within the selected range.</p>
        </div>
        <TrendChart items={data.daily_signups} />
      </section>

      <div className="two-column-grid">
        <section className="panel" aria-labelledby="analytics-source-title">
          <div className="panel-heading"><div><span className="eyebrow">Acquisition</span><h2 id="analytics-source-title">Sources</h2></div></div>
          <DistributionList
            emptyLabel="No source data in this range."
            items={data.source_distribution}
            showConverted
          />
        </section>
        <section className="panel" aria-labelledby="analytics-campaign-title">
          <div className="panel-heading"><div><span className="eyebrow">Acquisition</span><h2 id="analytics-campaign-title">Campaigns</h2></div></div>
          <DistributionList
            emptyLabel="No attributed campaigns in this range."
            items={data.campaigns}
            showConverted
          />
        </section>
        <section className="panel" aria-labelledby="analytics-platform-title">
          <div className="panel-heading"><div><span className="eyebrow">Audience</span><h2 id="analytics-platform-title">Platform interest</h2></div></div>
          <DistributionList emptyLabel="No platform data in this range." items={data.platform_distribution} />
        </section>
        <section className="panel" aria-labelledby="analytics-locale-title">
          <div className="panel-heading"><div><span className="eyebrow">Audience</span><h2 id="analytics-locale-title">Locales</h2></div></div>
          <DistributionList emptyLabel="No locale data in this range." items={data.locales} />
        </section>
        <section className="panel" aria-labelledby="analytics-email-title">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Engagement</span>
              <h2 id="analytics-email-title">Confirmation email</h2>
            </div>
            <p>Send acceptance only. Delivery is not tracked.</p>
          </div>
          <DistributionList
            emptyLabel="No confirmation email data in this range."
            items={data.email_status_distribution.map((item) => ({
              ...item,
              key:
                item.key === "sent"
                  ? "send accepted"
                  : "no accepted send recorded",
            }))}
          />
        </section>
      </div>

      <p className="data-note">
        Conversion reporting reflects only stored <code>converted_user_id</code> and <code>converted_at</code> values. Consumer conversion logic is not part of this phase.
      </p>
    </div>
  );
}
