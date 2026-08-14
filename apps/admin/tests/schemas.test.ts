import { describe, expect, it } from "vitest";
import { deploymentEnvironmentSchema } from "@aiyomi/schemas";

import {
  applicationSettingMutationSchema,
  featureFlagMutationSchema,
  parseWaitlistFilters,
  statusMutationSchema,
  waitlistFiltersSchema,
} from "../lib/admin/schemas";

describe("waitlist query validation", () => {
  it("parses bounded pagination and allowlisted sorting", () => {
    const parsed = parseWaitlistFilters({
      page: "3",
      pageSize: "50",
      sort: "email",
      status: "pending",
      converted: "false",
    });

    expect(parsed).toMatchObject({
      page: 3,
      pageSize: 50,
      sort: "email",
      status: "pending",
      converted: false,
    });
  });

  it("falls back safely for invalid page, sort, and date ranges", () => {
    expect(
      parseWaitlistFilters({
        page: "-4",
        pageSize: "10000",
        sort: "created_at; drop table",
        dateFrom: "2026-08-12",
        dateTo: "2026-01-01",
      }),
    ).toMatchObject({ page: 1, pageSize: 25, sort: "newest" });
  });

  it("rejects arbitrary filters at the strict export boundary", () => {
    expect(
      waitlistFiltersSchema.safeParse({ status: "deleted", page: 1, pageSize: 25 })
        .success,
    ).toBe(false);
  });
});

describe("privileged mutation validation", () => {
  it("accepts only supported lifecycle states and never fabricated conversion", () => {
    const signupId = "00000000-0000-4000-8000-000000000001";
    expect(statusMutationSchema.safeParse({ signupId, status: "invited" }).success).toBe(true);
    expect(statusMutationSchema.safeParse({ signupId, status: "converted" }).success).toBe(false);
    expect(statusMutationSchema.safeParse({ signupId, status: "deleted" }).success).toBe(false);
  });

  it("allowlists the current feature flag and deployment-safe URL settings", () => {
    expect(featureFlagMutationSchema.safeParse({ key: "waitlist_enabled", enabled: "true" }).success).toBe(true);
    expect(featureFlagMutationSchema.parse({ key: "waitlist_enabled", enabled: "false" }).enabled).toBe(false);
    expect(featureFlagMutationSchema.safeParse({ key: "waitlist_enabled", enabled: "off" }).success).toBe(false);
    expect(featureFlagMutationSchema.safeParse({ key: "future_ai", enabled: "true" }).success).toBe(false);
    expect(applicationSettingMutationSchema.safeParse({ key: "support_url", value: "https://aiyomi.example/support" }).success).toBe(true);
    expect(applicationSettingMutationSchema.safeParse({ key: "support_url", value: "javascript:alert(1)" }).success).toBe(false);
    expect(applicationSettingMutationSchema.safeParse({ key: "support_url", value: "https://aiyomi.example/support?token=value" }).success).toBe(false);
    expect(applicationSettingMutationSchema.safeParse({ key: "api_key", value: "secret" }).success).toBe(false);
    expect(deploymentEnvironmentSchema.safeParse("development").success).toBe(true);
    expect(deploymentEnvironmentSchema.safeParse("prod").success).toBe(false);
  });
});
