import "server-only";

import { redirect } from "next/navigation";

import {
  adminMemberSchema,
  hasPermission,
  type AdminMember,
  type AdminPermission,
} from "@/lib/admin/contracts";
import { callAdminRpcWithClient } from "@/lib/admin/rpc";
import { requireDeploymentEnvironment } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export class AdminAuthorizationError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403) {
    super(status === 401 ? "Authentication required." : "Permission denied.");
    this.name = "AdminAuthorizationError";
    this.status = status;
  }
}

export const getCurrentAdmin = async (): Promise<AdminMember | null> => {
  const client = await createAdminSupabaseClient();
  const { data, error } = await client.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  try {
    const membership = await callAdminRpcWithClient(
      client,
      "admin_get_current_member",
      { p_expected_environment: requireDeploymentEnvironment() },
    );
    const result = adminMemberSchema.safeParse(membership);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const requireActiveAdmin = async () => {
  const member = await getCurrentAdmin();

  if (!member) {
    redirect("/access-denied");
  }

  return member;
};

export const requireAdminPermission = async (
  permission: AdminPermission,
) => {
  const member = await requireActiveAdmin();

  if (!hasPermission(member, permission)) {
    redirect("/access-denied?reason=permission");
  }

  return member;
};

export const authorizeAdminPermission = async (
  permission: AdminPermission,
) => {
  const client = await createAdminSupabaseClient();
  const { data, error } = await client.auth.getClaims();

  if (error || !data?.claims?.sub) {
    throw new AdminAuthorizationError(401);
  }

  let rawMembership: unknown;

  try {
    rawMembership = await callAdminRpcWithClient(
      client,
      "admin_get_current_member",
      { p_expected_environment: requireDeploymentEnvironment() },
    );
  } catch {
    throw new AdminAuthorizationError(403);
  }

  const membership = adminMemberSchema.safeParse(rawMembership);

  if (!membership.success || !hasPermission(membership.data, permission)) {
    throw new AdminAuthorizationError(403);
  }

  return { client, member: membership.data };
};
