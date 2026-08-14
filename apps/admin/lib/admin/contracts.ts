import {
  adminCurrentMemberSchema,
  adminMemberRoleSchema,
  adminPermissionSchema,
} from "@aiyomi/schemas";
import {
  ADMIN_MEMBER_ROLES,
  ADMIN_PERMISSIONS,
  type AdminCurrentMember,
  type AdminMemberRole,
  type AdminPermission,
} from "@aiyomi/types";

export const adminRoles = ADMIN_MEMBER_ROLES;
export const adminPermissions = ADMIN_PERMISSIONS;
export const adminRoleSchema = adminMemberRoleSchema;
export { adminPermissionSchema };
export type AdminRole = AdminMemberRole;
export type { AdminPermission };

export const rolePermissionMatrix: Readonly<
  Record<AdminRole, readonly AdminPermission[]>
> = {
  super_admin: adminPermissions,
  admin: [
    "dashboard.read",
    "waitlist.read",
    "waitlist.status.write",
    "waitlist.export",
    "analytics.read",
    "referrals.read",
    "audit.read",
    "admins.read",
    "feature_flags.read",
    "feature_flags.write",
    "settings.read",
  ],
  analyst: ["dashboard.read", "analytics.read", "referrals.read"],
  support: ["waitlist.read", "waitlist.status.write"],
};

export const adminMemberSchema = adminCurrentMemberSchema;
export type AdminMember = AdminCurrentMember;

export const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  analyst: "Analyst",
  support: "Support",
};

export const hasPermission = (
  member: AdminMember,
  permission: AdminPermission,
) => member.permissions.includes(permission);

export const getDefaultAdminPath = (member: AdminMember) =>
  hasPermission(member, "dashboard.read") ? "/dashboard" : "/waitlist";

export type AdminAccessDecision =
  | "allowed"
  | "unauthenticated"
  | "not_admin"
  | "suspended"
  | "permission_denied";

export const evaluateAdminAccess = (
  authenticated: boolean,
  membership:
    | {
        role: AdminRole;
        status: "active" | "suspended";
        permissions: readonly AdminPermission[];
      }
    | null,
  permission: AdminPermission,
): AdminAccessDecision => {
  if (!authenticated) return "unauthenticated";
  if (!membership) return "not_admin";
  if (membership.status !== "active") return "suspended";
  return membership.permissions.includes(permission)
    ? "allowed"
    : "permission_denied";
};
