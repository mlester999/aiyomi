import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

let consumerMigration = "";
let notificationMigration = "";
let workflowMigration = "";

beforeAll(() => {
  const migrationsDirectory = resolve(process.cwd(), "../../supabase/migrations");

  consumerMigration = readFileSync(
    resolve(migrationsDirectory, "202608140001_create_consumer_foundation.sql"),
    "utf8",
  );
  notificationMigration = readFileSync(
    resolve(migrationsDirectory, "202608140002_create_notification_foundation.sql"),
    "utf8",
  );
  workflowMigration = readFileSync(
    resolve(migrationsDirectory, "202608140003_create_mobile_auth_workflows.sql"),
    "utf8",
  );
});

describe("Phase 3 mobile database contract", () => {
  it("creates the normalized consumer foundation with stable mobile names", () => {
    for (const table of [
      "profiles",
      "companion_definitions",
      "user_companions",
      "life_area_definitions",
      "user_life_areas",
      "life_role_definitions",
      "user_life_roles",
      "user_schedule_preferences",
      "fixed_commitments",
      "onboarding_intentions",
      "obstacle_definitions",
      "user_obstacles",
    ]) {
      expect(consumerMigration).toContain(`create table public.${table}`);
    }

    expect(consumerMigration).toContain("custom_name text not null");
    expect(consumerMigration).toContain("create type public.mobile_onboarding_step as enum");
    expect(consumerMigration).toContain(
      "onboarding_step public.mobile_onboarding_step",
    );
    expect(consumerMigration).toContain("pre_auth_intent public.pre_auth_intent");
    expect(consumerMigration).toContain("improvement_focus text not null");
    expect(consumerMigration).toContain("energy_baseline public.energy_baseline");
    expect(consumerMigration).toContain("obstacle_key text not null");
    expect(consumerMigration).toContain("custom_label text");
    expect(consumerMigration).toContain("grant update (custom_label)");
  });

  it("forces RLS on every consumer table and scopes private rows to owners", () => {
    for (const table of [
      "profiles",
      "companion_definitions",
      "user_companions",
      "life_area_definitions",
      "user_life_areas",
      "life_role_definitions",
      "user_life_roles",
      "user_schedule_preferences",
      "fixed_commitments",
      "onboarding_intentions",
      "obstacle_definitions",
      "user_obstacles",
    ]) {
      expect(consumerMigration).toContain(
        `alter table public.${table} enable row level security`,
      );
      expect(consumerMigration).toContain(
        `alter table public.${table} force row level security`,
      );
    }

    expect(consumerMigration).toContain("using ((select auth.uid()) = user_id)");
    expect(consumerMigration).toContain("with check ((select auth.uid()) = user_id)");
    expect(consumerMigration).toContain("using ((select auth.uid()) = id)");
    expect(consumerMigration).not.toContain(
      "grant update on table public.profiles to authenticated",
    );
  });

  it("keeps catalog writes server-controlled and exposes only active choices", () => {
    for (const table of [
      "companion_definitions",
      "life_area_definitions",
      "life_role_definitions",
      "obstacle_definitions",
    ]) {
      expect(consumerMigration).toContain(
        `revoke all on table public.${table} from public, anon, authenticated`,
      );
      expect(consumerMigration).toContain(
        `grant select on table public.${table} to authenticated`,
      );
    }

    expect(consumerMigration.match(/using \(active\);/g)).toHaveLength(4);
    expect(consumerMigration).toContain("'mori'");
    expect(consumerMigration).toContain("'lumi'");
    expect(consumerMigration).toContain("'piko'");
  });

  it("stores explicit notification choices and private multi-device tokens", () => {
    expect(notificationMigration).toContain(
      "create table public.notification_preferences",
    );
    for (const column of [
      "morning_plan",
      "upcoming_activity",
      "schedule_adjustments",
      "focus_reminder",
      "break_finished",
      "daily_reflection",
      "weekly_recap",
      "streak_reminder",
      "achievements",
      "quiet_hours_enabled",
      "quiet_start",
      "quiet_end",
      "timezone",
    ]) {
      expect(notificationMigration).toContain(column);
    }

    expect(notificationMigration).toContain("create table public.device_push_tokens");
    expect(notificationMigration).toContain(
      "constraint device_push_tokens_installation_unique unique",
    );
    expect(notificationMigration).toContain("expo_push_token text");
    expect(notificationMigration).not.toContain("expo_push_token text not null");
    expect(notificationMigration).toContain(
      "create unique index device_push_tokens_token_key",
    );
    expect(notificationMigration).toContain(
      "where expo_push_token is not null",
    );
    expect(notificationMigration).toContain("permission_status = 'granted'");
    expect(notificationMigration).toContain("and expo_push_token is not null");
    expect(notificationMigration).toContain(
      "create or replace function private.set_device_push_token_timestamps()",
    );
    expect(notificationMigration).toContain(
      "if new.last_seen_at < new.created_at then",
    );
    expect(notificationMigration).toContain(
      "create policy device_push_tokens_own_rows",
    );
    expect(notificationMigration).toContain(
      "alter table public.device_push_tokens force row level security",
    );
    expect(notificationMigration).toContain(
      "alter table public.notification_preferences enable row level security",
    );
    expect(notificationMigration).toContain(
      "alter table public.notification_preferences force row level security",
    );
  });

  it("creates profiles idempotently and converts only verified Auth emails", () => {
    expect(workflowMigration).toContain(
      "create trigger create_mobile_profile_after_auth_user_insert",
    );
    expect(workflowMigration).toContain("on conflict (id) do nothing");
    expect(workflowMigration).toContain("p_email_confirmed_at is null");
    expect(workflowMigration).toContain("new.email_confirmed_at");
    expect(workflowMigration).toContain("signup.email = lower(btrim(p_email))");
    expect(workflowMigration).toContain(
      "when signup.status = 'unsubscribed' then signup.status",
    );
    expect(workflowMigration).toContain(
      "else 'converted'::public.waitlist_signup_status",
    );
    expect(workflowMigration).toContain("from auth.users as auth_user");
  });

  it("provides caller-scoped repair and atomic completion RPCs", () => {
    expect(workflowMigration).toContain(
      "create or replace function public.ensure_mobile_profile()",
    );
    expect(workflowMigration).toContain(
      "create or replace function public.complete_mobile_onboarding()",
    );
    expect(workflowMigration.match(/security definer/g)).toHaveLength(5);
    expect(workflowMigration.match(/set search_path = ''/g)).toHaveLength(5);
    expect(workflowMigration.match(/v_user_id uuid := auth\.uid\(\)/g)).toHaveLength(2);
    expect(workflowMigration).toContain("where profile.id = v_user_id\n  for update");
    for (const requiredTable of [
      "user_companions",
      "user_life_areas",
      "user_schedule_preferences",
      "user_life_roles",
      "onboarding_intentions",
      "notification_preferences",
    ]) {
      expect(workflowMigration).toContain(`public.${requiredTable}`);
    }
    expect(workflowMigration).toContain("onboarding_status = 'completed'");
    expect(workflowMigration).toContain("onboarding_step = null");
    expect(workflowMigration).toContain("onboarding_completed_at = now()");
    expect(workflowMigration).toContain(
      "grant execute on function public.ensure_mobile_profile() to authenticated",
    );
    expect(workflowMigration).toContain(
      "grant execute on function public.complete_mobile_onboarding() to authenticated",
    );
  });

  it("does not weaken existing waitlist or admin table grants", () => {
    const phase3Migrations = [
      consumerMigration,
      notificationMigration,
      workflowMigration,
    ].join("\n");

    expect(phase3Migrations).not.toMatch(
      /grant\s+[^;]*on table public\.admin_/i,
    );
    expect(phase3Migrations).not.toMatch(
      /grant\s+[^;]*on table public\.waitlist_signups/i,
    );
    expect(phase3Migrations).not.toContain("create policy waitlist");
    expect(phase3Migrations).not.toContain("create policy admin");
  });
});
