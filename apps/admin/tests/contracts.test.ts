import { describe, expect, it } from "vitest";

import {
  evaluateAdminAccess,
  getDefaultAdminPath,
  rolePermissionMatrix,
  type AdminRole,
} from "../lib/admin/contracts";

const membership = (
  role: AdminRole,
  status: "active" | "suspended" = "active",
) => ({ role, status, permissions: rolePermissionMatrix[role] });

describe("admin access decisions", () => {
  it("rejects unauthenticated, non-admin, and suspended callers", () => {
    expect(evaluateAdminAccess(false, null, "dashboard.read")).toBe(
      "unauthenticated",
    );
    expect(evaluateAdminAccess(true, null, "dashboard.read")).toBe("not_admin");
    expect(
      evaluateAdminAccess(
        true,
        membership("super_admin", "suspended"),
        "dashboard.read",
      ),
    ).toBe("suspended");
  });

  it("allows active members only within their role permissions", () => {
    expect(
      evaluateAdminAccess(true, membership("analyst"), "analytics.read"),
    ).toBe("allowed");
    expect(
      evaluateAdminAccess(true, membership("analyst"), "waitlist.export"),
    ).toBe("permission_denied");
    expect(
      evaluateAdminAccess(true, membership("support"), "waitlist.read"),
    ).toBe("allowed");
    expect(
      evaluateAdminAccess(true, membership("support"), "analytics.read"),
    ).toBe("permission_denied");
  });

  it("keeps Super Admin membership management owner-only", () => {
    expect(rolePermissionMatrix.super_admin).toContain("admins.write");
    expect(rolePermissionMatrix.admin).not.toContain("admins.write");
    expect(rolePermissionMatrix.analyst).not.toContain("admins.write");
    expect(rolePermissionMatrix.support).not.toContain("admins.write");
  });

  it("routes Support to its first authorized workspace", () => {
    expect(
      getDefaultAdminPath({
        ...membership("support"),
        id: "00000000-0000-4000-8000-000000000001",
        userId: "00000000-0000-4000-8000-000000000002",
        email: "support@example.com",
        displayName: null,
        permissions: [...rolePermissionMatrix.support],
        status: "active",
      }),
    ).toBe("/waitlist");
  });
});
