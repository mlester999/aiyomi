import type { Metadata } from "next";

import { EmptyState, PageHeader, StatusBadge } from "@/components/admin-ui";
import { SubmitButton } from "@/components/submit-button";
import { hasPermission, roleLabels } from "@/lib/admin/contracts";
import { createAdminMemberAction, updateAdminMemberAction } from "@/lib/admin/actions";
import { getAdminMembers } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/admin/format";
import { adminRoles } from "@/lib/admin/contracts";
import { requireAdminPermission } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Admin members" };

interface AdminsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
  const params = await searchParams;
  const [member, members] = await Promise.all([
    requireAdminPermission("admins.read"),
    getAdminMembers(),
  ]);
  const canManage = hasPermission(member, "admins.write");

  return (
    <div className="page-stack">
      <PageHeader
        description="Explicit memberships control access after Supabase authentication."
        eyebrow="System"
        title="Admin members"
      />

      {params.saved && <p className="notice notice-success" role="status">Admin membership saved and audited.</p>}
      {params.error === "operation" && <p className="notice notice-error" role="alert">That membership change was rejected. Check the user UUID and lockout protections.</p>}

      {canManage && (
        <section className="panel" aria-labelledby="add-admin-title">
          <div className="panel-heading"><div><span className="eyebrow">Super Admin only</span><h2 id="add-admin-title">Add an existing Auth user</h2></div><p>This does not create or invite an Auth account.</p></div>
          <form action={createAdminMemberAction} className="inline-form">
            <label className="field-wide"><span>Supabase Auth user UUID</span><input name="userId" placeholder="00000000-0000-0000-0000-000000000000" required /></label>
            <label><span>Display name</span><input maxLength={100} name="displayName" /></label>
            <label><span>Role</span><select defaultValue="support" name="role">{adminRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label>
            <SubmitButton confirmation="Add this existing Auth user as an admin member?" pendingLabel="Adding…">Add member</SubmitButton>
          </form>
        </section>
      )}

      <section className="table-panel" aria-labelledby="members-title">
        <div className="table-panel-heading"><div><h2 id="members-title">Memberships</h2><p>{members.length} visible records</p></div></div>
        {members.length ? (
          <>
          <div className="table-scroll desktop-data-table">
            <table>
              <thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Updated</th>{canManage && <th scope="col">Management</th>}</tr></thead>
              <tbody>
                {members.map((admin) => (
                  <tr key={admin.id}>
                    <td><strong className="table-primary">{admin.display_name ?? admin.email}</strong><small>{admin.email}</small></td>
                    <td>{roleLabels[admin.role]}</td>
                    <td><StatusBadge value={admin.status} /></td>
                    <td>{formatDateTime(admin.created_at)}</td>
                    <td>{formatDateTime(admin.updated_at)}</td>
                    {canManage && (
                      <td>
                        <details className="row-disclosure">
                          <summary className="text-link">Edit</summary>
                          <form action={updateAdminMemberAction} className="row-form">
                            <input name="memberId" type="hidden" value={admin.id} />
                            <label><span>Display name</span><input defaultValue={admin.display_name ?? ""} maxLength={100} name="displayName" /></label>
                            <label><span>Role</span><select defaultValue={admin.role} name="role">{adminRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label>
                            <label><span>Status</span><select defaultValue={admin.status} name="status"><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
                            <SubmitButton className="button button-primary button-small" confirmation="Save this membership change? The action will be audited." pendingLabel="Saving…">Save</SubmitButton>
                          </form>
                        </details>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-record-list">
            {members.map((admin) => (
              <article className="mobile-record-card" key={admin.id}>
                <div className="mobile-record-card-heading">
                  <div>
                    <strong>{admin.display_name ?? admin.email}</strong>
                    <span>{admin.email}</span>
                  </div>
                  <StatusBadge value={admin.status} />
                </div>
                <div className="mobile-record-meta">
                  <span>{roleLabels[admin.role]}</span>
                  <span>Updated {formatDateTime(admin.updated_at)}</span>
                </div>
                {canManage && (
                  <details className="row-disclosure mobile-record-details">
                    <summary className="text-link">Edit membership</summary>
                    <form action={updateAdminMemberAction} className="row-form">
                      <input name="memberId" type="hidden" value={admin.id} />
                      <label><span>Display name</span><input defaultValue={admin.display_name ?? ""} maxLength={100} name="displayName" /></label>
                      <label><span>Role</span><select defaultValue={admin.role} name="role">{adminRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label>
                      <label><span>Status</span><select defaultValue={admin.status} name="status"><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
                      <SubmitButton className="button button-primary button-small" confirmation="Save this membership change? The action will be audited." pendingLabel="Saving...">Save</SubmitButton>
                    </form>
                  </details>
                )}
              </article>
            ))}
          </div>
          </>
        ) : <EmptyState description="Bootstrap the first Super Admin through the documented trusted database process." title="No admin memberships" />}
      </section>

      <p className="data-note">The final active Super Admin cannot be suspended or demoted. Auth accounts must be created separately through an owner-controlled process.</p>
    </div>
  );
}
