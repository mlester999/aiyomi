import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

let authorizationMigration = "";
let operationsMigration = "";

beforeAll(() => {
  authorizationMigration = readFileSync(
    resolve(process.cwd(), "../../supabase/migrations/202608120001_create_admin_authorization.sql"),
    "utf8",
  );
  operationsMigration = readFileSync(
    resolve(process.cwd(), "../../supabase/migrations/202608120002_create_admin_operations.sql"),
    "utf8",
  );
});

describe("Phase 2 database security contract", () => {
  it("requires explicit active membership and forces RLS", () => {
    expect(authorizationMigration).toContain("member.status = 'active'");
    expect(authorizationMigration).toContain("force row level security");
    expect(authorizationMigration).toContain("revoke all on table public.admin_members from anon, authenticated");
  });

  it("keeps the audit log append-only", () => {
    expect(authorizationMigration).toContain("prevent_admin_audit_update_or_delete");
    expect(authorizationMigration).toContain("prevent_admin_audit_truncate");
    expect(operationsMigration).toContain("private.write_admin_audit");
  });

  it("protects the final active Super Admin", () => {
    expect(operationsMigration).toContain("protect_last_active_super_admin");
    expect(operationsMigration).toContain("final active Super Admin");
    expect(operationsMigration).toContain("pg_advisory_xact_lock");
  });

  it("locks environment mutations and bounds export rows", () => {
    expect(operationsMigration).toContain("prevent_admin_environment_change");
    expect(operationsMigration).toContain("p_limit integer default 5000");
    expect(operationsMigration).toContain("p_limit not between 1 and 5000");
    expect(operationsMigration).toContain("'waitlist.export'");
    expect(operationsMigration).toContain(
      "public.admin_get_current_member(\n  p_expected_environment public.deployment_environment",
    );
    expect(operationsMigration).toContain(
      "revoke all on function public.admin_get_current_member()",
    );
  });

  it("audits waitlist, member, flag, setting, and export mutations", () => {
    for (const action of [
      "waitlist.status_changed",
      "waitlist.exported",
      "admin_member.created",
      "admin.role_updated",
      "admin.suspended",
      "admin.reactivated",
      "admin.profile_updated",
      "feature_flag.updated",
      "application_setting.updated",
    ]) {
      expect(operationsMigration).toContain(action);
    }
  });
});
