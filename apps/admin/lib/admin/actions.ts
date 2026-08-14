"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";

import { callAdminRpcWithClient } from "@/lib/admin/rpc";
import {
  applicationSettingMutationSchema,
  featureFlagMutationSchema,
  memberCreateSchema,
  memberUpdateSchema,
  statusMutationSchema,
} from "@/lib/admin/schemas";
import { authorizeAdminPermission } from "@/lib/auth/authorization";
import { requireDeploymentEnvironment } from "@/lib/env";

const safeFailure = (path: string): never => {
  redirect(`${path}?error=operation`);
};

const parseForm = <Output>(
  schema: z.ZodType<Output>,
  value: unknown,
  failurePath: string,
): Output => {
  const result = schema.safeParse(value);
  return result.success ? result.data : safeFailure(failurePath);
};

export const updateWaitlistStatusAction = async (formData: FormData) => {
  const data = parseForm(statusMutationSchema, {
    signupId: formData.get("signupId"),
    status: formData.get("status"),
  }, "/waitlist");

  const { client } = await authorizeAdminPermission("waitlist.status.write");

  try {
    await callAdminRpcWithClient(client, "admin_update_waitlist_status", {
      p_signup_id: data.signupId,
      p_status: data.status,
      p_request_id: randomUUID(),
      p_expected_environment: requireDeploymentEnvironment(),
    });
  } catch {
    safeFailure(`/waitlist/${data.signupId}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/waitlist");
  revalidatePath(`/waitlist/${data.signupId}`);
  redirect(`/waitlist/${data.signupId}?saved=status`);
};

export const createAdminMemberAction = async (formData: FormData) => {
  const data = parseForm(memberCreateSchema, {
    userId: formData.get("userId"),
    role: formData.get("role"),
    displayName: formData.get("displayName"),
  }, "/admins");

  const { client } = await authorizeAdminPermission("admins.write");

  try {
    await callAdminRpcWithClient(client, "admin_create_member", {
      p_user_id: data.userId,
      p_role: data.role,
      p_status: "active",
      p_display_name: data.displayName ?? null,
      p_request_id: randomUUID(),
      p_expected_environment: requireDeploymentEnvironment(),
    });
  } catch {
    safeFailure("/admins");
  }

  revalidatePath("/admins");
  redirect("/admins?saved=created");
};

export const updateAdminMemberAction = async (formData: FormData) => {
  const data = parseForm(memberUpdateSchema, {
    memberId: formData.get("memberId"),
    role: formData.get("role"),
    status: formData.get("status"),
    displayName: formData.get("displayName"),
  }, "/admins");

  const { client } = await authorizeAdminPermission("admins.write");

  try {
    await callAdminRpcWithClient(client, "admin_update_member", {
      p_member_id: data.memberId,
      p_role: data.role,
      p_status: data.status,
      p_display_name: data.displayName ?? null,
      p_request_id: randomUUID(),
      p_expected_environment: requireDeploymentEnvironment(),
    });
  } catch {
    safeFailure("/admins");
  }

  revalidatePath("/admins");
  redirect("/admins?saved=updated");
};

export const updateFeatureFlagAction = async (formData: FormData) => {
  const data = parseForm(featureFlagMutationSchema, {
    key: formData.get("key"),
    enabled: formData.get("enabled"),
  }, "/feature-flags");

  const { client } = await authorizeAdminPermission("feature_flags.write");

  try {
    await callAdminRpcWithClient(client, "admin_update_feature_flag", {
      p_key: data.key,
      p_enabled: data.enabled,
      p_request_id: randomUUID(),
      p_expected_environment: requireDeploymentEnvironment(),
    });
  } catch {
    safeFailure("/feature-flags");
  }

  revalidatePath("/feature-flags");
  redirect("/feature-flags?saved=flag");
};

export const updateApplicationSettingAction = async (formData: FormData) => {
  const data = parseForm(applicationSettingMutationSchema, {
    key: formData.get("key"),
    value: formData.get("value"),
  }, "/settings");

  const { client } = await authorizeAdminPermission("settings.write");

  try {
    await callAdminRpcWithClient(client, "admin_update_application_setting", {
      p_key: data.key,
      p_value: data.value,
      p_request_id: randomUUID(),
      p_expected_environment: requireDeploymentEnvironment(),
    });
  } catch {
    safeFailure("/settings");
  }

  revalidatePath("/settings");
  redirect("/settings?saved=setting");
};
