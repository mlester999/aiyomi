import type { Metadata } from "next";

import { PageHeader } from "@/components/admin-ui";
import { SubmitButton } from "@/components/submit-button";
import { updateApplicationSettingAction } from "@/lib/admin/actions";
import { hasPermission } from "@/lib/admin/contracts";
import { getApplicationSettings } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/admin/format";
import { requireAdminPermission } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Settings" };

interface SettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const settingDefinitions = [
  { key: "support_url", label: "Support URL", description: "Public destination for support requests." },
  { key: "privacy_url", label: "Privacy URL", description: "Public privacy-policy destination." },
  { key: "terms_url", label: "Terms URL", description: "Public terms-of-use destination." },
] as const;

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const [member, settings] = await Promise.all([
    requireAdminPermission("settings.read"),
    getApplicationSettings(),
  ]);
  const canWrite = hasPermission(member, "settings.write");
  const settingsByKey = new Map(settings.map((setting) => [setting.key, setting]));

  return (
    <div className="page-stack">
      <PageHeader
        description="A small allowlist of public destinations. Secrets are never stored here."
        eyebrow="System"
        title="Settings"
      />

      {params.saved === "setting" && <p className="notice notice-success" role="status">Setting updated and audited.</p>}
      {params.error === "operation" && <p className="notice notice-error" role="alert">The setting was not changed. Use a valid public URL and confirm the environment lock.</p>}

      <section className="card-list" aria-label="Application settings">
        {settingDefinitions.map((definition) => {
          const setting = settingsByKey.get(definition.key);

          return (
            <article className="operation-card" key={definition.key}>
              <div className="operation-card-main">
                <div>
                  <span className="eyebrow">{setting?.environment ?? "Current environment"}</span>
                  <h2>{definition.label}</h2>
                  <p>{definition.description}</p>
                </div>
              </div>
              {canWrite ? (
                <form action={updateApplicationSettingAction} className="setting-form">
                  <input name="key" type="hidden" value={definition.key} />
                  <label>
                    <span>Public URL</span>
                    <input defaultValue={setting?.value ?? ""} maxLength={500} name="value" placeholder="https://www.example.com/path" required type="url" />
                  </label>
                  <SubmitButton confirmation={`Save ${definition.label}? This change will be audited.`} pendingLabel="Saving…">Save setting</SubmitButton>
                </form>
              ) : (
                <p className="readonly-value">{setting?.value ?? "Not configured"}</p>
              )}
              {setting && <div className="operation-meta"><span>Updated {formatDateTime(setting.updated_at)}</span><span>By {setting.updated_by_email ?? "bootstrap process"}</span></div>}
            </article>
          );
        })}
      </section>

      <p className="data-note">These values are an audited configuration foundation. Each consuming application must intentionally adopt a setting before it changes public behavior.</p>
    </div>
  );
}
