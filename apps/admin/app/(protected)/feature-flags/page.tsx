import type { Metadata } from "next";

import { EmptyState, PageHeader, StatusBadge } from "@/components/admin-ui";
import { SubmitButton } from "@/components/submit-button";
import { updateFeatureFlagAction } from "@/lib/admin/actions";
import { hasPermission } from "@/lib/admin/contracts";
import { getFeatureFlags } from "@/lib/admin/data";
import { formatDateTime, humanizeKey } from "@/lib/admin/format";
import { requireAdminPermission } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Feature flags" };

interface FeatureFlagsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FeatureFlagsPage({ searchParams }: FeatureFlagsPageProps) {
  const params = await searchParams;
  const [member, flags] = await Promise.all([
    requireAdminPermission("feature_flags.read"),
    getFeatureFlags(),
  ]);
  const canWrite = hasPermission(member, "feature_flags.write");

  return (
    <div className="page-stack">
      <PageHeader
        description="Environment-scoped controls that are consumed by current product behavior."
        eyebrow="System"
        title="Feature flags"
      />

      {params.saved === "flag" && <p className="notice notice-success" role="status">Feature flag updated and audited.</p>}
      {params.error === "operation" && <p className="notice notice-error" role="alert">The flag was not changed. Confirm this deployment matches the locked database environment.</p>}

      <section className="card-list" aria-label="Feature flags">
        {flags.length ? flags.map((flag) => (
          <article className="operation-card" key={flag.id}>
            <div className="operation-card-main">
              <div>
                <span className="eyebrow">{humanizeKey(flag.environment)}</span>
                <h2><code>{flag.key}</code></h2>
                <p>{flag.description}</p>
              </div>
              <StatusBadge value={flag.enabled ? "enabled" : "disabled"} />
            </div>
            <div className="operation-meta">
              <span>Updated {formatDateTime(flag.updated_at)}</span>
              <span>By {flag.updated_by_email ?? "bootstrap process"}</span>
            </div>
            {canWrite && (
              <form action={updateFeatureFlagAction}>
                <input name="key" type="hidden" value={flag.key} />
                <input name="enabled" type="hidden" value={String(!flag.enabled)} />
                <SubmitButton
                  className={flag.enabled ? "button button-danger" : "button button-primary"}
                  confirmation={`${flag.enabled ? "Disable" : "Enable"} ${flag.key} for ${flag.environment}? This changes live behavior in this environment.`}
                  pendingLabel="Updating…"
                >
                  {flag.enabled ? "Disable" : "Enable"}
                </SubmitButton>
              </form>
            )}
          </article>
        )) : (
          <EmptyState description="Apply the Phase 2 operations migration to seed the environment-scoped waitlist flag." title="No flags configured" />
        )}
      </section>

      <p className="data-note">Only <code>waitlist_enabled</code> exists in this phase. The public waitlist checks this value before accepting a signup.</p>
    </div>
  );
}
