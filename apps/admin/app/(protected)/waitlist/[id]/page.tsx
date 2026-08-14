import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader, StatusBadge } from "@/components/admin-ui";
import { SubmitButton } from "@/components/submit-button";
import { updateWaitlistStatusAction } from "@/lib/admin/actions";
import { hasPermission } from "@/lib/admin/contracts";
import { getWaitlistLead } from "@/lib/admin/data";
import { formatDateTime, humanizeKey, statusLabel } from "@/lib/admin/format";
import { mutableWaitlistStatusValues } from "@/lib/admin/schemas";
import { requireAdminPermission } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Waitlist lead" };

interface LeadPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function DetailRows({ rows }: { rows: ReadonlyArray<[string, React.ReactNode]> }) {
  return (
    <dl className="detail-list">
      {rows.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value ?? "Not available"}</dd></div>
      ))}
    </dl>
  );
}

export default async function LeadPage({ params, searchParams }: LeadPageProps) {
  const { id } = await params;
  const query = await searchParams;

  if (!z.string().uuid().safeParse(id).success) notFound();

  const [member, detail] = await Promise.all([
    requireAdminPermission("waitlist.read"),
    getWaitlistLead(id),
  ]);

  if (!detail) notFound();

  const { lead, lifecycle, email, attribution, referral, consent, conversion, access } = detail;
  const allowedStatusValues =
    member.role === "support"
      ? (["unsubscribed"] as const)
      : mutableWaitlistStatusValues;
  const defaultStatus =
    allowedStatusValues.find((status) => status === lead.status) ??
    allowedStatusValues[0];
  const canChangeStatus =
    hasPermission(member, "waitlist.status.write") &&
    lead.status !== "converted" &&
    allowedStatusValues.some((status) => status !== lead.status);

  return (
    <div className="page-stack">
      <Link className="back-link" href="/waitlist">← Back to waitlist</Link>
      <PageHeader
        actions={<StatusBadge value={lead.status} />}
        description={lead.first_name ?? "Name not provided"}
        eyebrow="Waitlist lead"
        title={lead.email}
      />

      {query.saved === "status" && <p className="notice notice-success" role="status">Lifecycle status updated and audited.</p>}
      {query.error === "operation" && <p className="notice notice-error" role="alert">The status change was rejected. No changes were made.</p>}
      {access.redacted && (
        <p className="notice notice-neutral" role="status">
          Support access is limited. {access.redacted_sections.map(humanizeKey).join(", ")} details are hidden.
        </p>
      )}

      {canChangeStatus && (
        <section className="panel compact-panel" aria-labelledby="status-title">
          <div><span className="eyebrow">Lifecycle</span><h2 id="status-title">Change status</h2><p>Conversion status is set only by a real consumer-account conversion.</p></div>
          <form action={updateWaitlistStatusAction} className="status-form">
            <input name="signupId" type="hidden" value={lead.id} />
            <label><span>New status</span><select defaultValue={defaultStatus} name="status">{allowedStatusValues.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
            <SubmitButton confirmation="Change this lead's lifecycle status? This action will be audited." pendingLabel="Updating…">Update status</SubmitButton>
          </form>
        </section>
      )}

      <div className="detail-grid">
        <section className="panel" aria-labelledby="identity-title">
          <div className="panel-heading"><div><span className="eyebrow">Lead</span><h2 id="identity-title">Identity</h2></div></div>
          <DetailRows rows={[["Email", lead.email], ["First name", lead.first_name], ["Platform", humanizeKey(lead.platform_interest)], ["Lead ID", <code key="id">{lead.id}</code>]]} />
        </section>
        <section className="panel" aria-labelledby="lifecycle-title">
          <div className="panel-heading"><div><span className="eyebrow">Timeline</span><h2 id="lifecycle-title">Lifecycle</h2></div></div>
          <DetailRows rows={[["Status", statusLabel(lifecycle.status)], ["Joined", formatDateTime(lifecycle.created_at)], ["Last updated", formatDateTime(lifecycle.updated_at)]]} />
        </section>
        <section className="panel" aria-labelledby="email-title">
          <div className="panel-heading"><div><span className="eyebrow">Messaging</span><h2 id="email-title">Email status</h2></div></div>
          <DetailRows rows={[["Confirmation", email.status === "sent" ? "Send accepted" : "Not sent"], ["Send accepted at", formatDateTime(email.confirmation_sent_at)], ["Delivery", email.status === "sent" ? "Unknown, no delivery webhook is stored" : "Not applicable"]]} />
        </section>
        <section className="panel" aria-labelledby="conversion-title">
          <div className="panel-heading"><div><span className="eyebrow">Conversion</span><h2 id="conversion-title">Consumer account</h2></div></div>
          <DetailRows rows={[["Converted", conversion.converted ? "Yes" : "No"], ["Converted at", formatDateTime(conversion.converted_at ?? null)], ["Converted user ID", conversion.converted_user_id ? <code key="converted-id">{conversion.converted_user_id}</code> : "Not available"]]} />
        </section>
        {!access.redacted && (
          <>
            <section className="panel" aria-labelledby="attribution-title">
              <div className="panel-heading"><div><span className="eyebrow">Acquisition</span><h2 id="attribution-title">Attribution</h2></div></div>
              <DetailRows rows={[["Source", attribution.source ? humanizeKey(attribution.source) : null], ["UTM source", attribution.utm_source], ["UTM medium", attribution.utm_medium], ["UTM campaign", attribution.utm_campaign], ["UTM content", attribution.utm_content], ["UTM term", attribution.utm_term], ["Locale", attribution.locale]]} />
            </section>
            <section className="panel" aria-labelledby="referral-title">
              <div className="panel-heading"><div><span className="eyebrow">Growth loop</span><h2 id="referral-title">Referral</h2></div></div>
              <DetailRows rows={[["Referral code", referral.referral_code ? <code key="code">{referral.referral_code}</code> : null], ["Referred by", referral.referred_by ? `${referral.referred_by.first_name ?? referral.referred_by.email} (${referral.referred_by.referral_code ?? "no code"})` : "Direct or unresolved"], ["Successful referrals", referral.referral_count ?? 0]]} />
            </section>
            <section className="panel" aria-labelledby="consent-title">
              <div className="panel-heading"><div><span className="eyebrow">Privacy</span><h2 id="consent-title">Consent</h2></div></div>
              <DetailRows rows={[["Marketing consent", consent.marketing_consent ? "Granted" : "Not granted"], ["Consent time", formatDateTime(consent.consent_at ?? null)]]} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
