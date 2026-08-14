import "server-only";

import type { z } from "zod";

import type { AdminPermission } from "@/lib/admin/contracts";
import { callAdminRpc } from "@/lib/admin/rpc";
import {
  analyticsSchema,
  auditRowsSchema,
  dashboardSchema,
  flagsSchema,
  leadDetailSchema,
  membersSchema,
  referralsSchema,
  settingsSchema,
  waitlistRowsSchema,
  type WaitlistFilters,
} from "@/lib/admin/schemas";
import { requireAdminPermission } from "@/lib/auth/authorization";

const parseRpcResult = <Output>(schema: z.ZodType<Output>, value: unknown) => {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    console.error("Admin RPC returned an invalid shape", {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
      })),
    });
    throw new Error("The admin data response was invalid.");
  }

  return parsed.data;
};

export const getDashboardData = async () => {
  await requireAdminPermission("dashboard.read");
  return parseRpcResult(
    dashboardSchema,
    await callAdminRpc("admin_get_dashboard", { p_days: 30 }),
  );
};

export const waitlistFilterRpcArgs = (filters: WaitlistFilters) => ({
  p_search: filters.query ?? null,
  p_status: filters.status ?? null,
  p_platform: filters.platform ?? null,
  p_source: filters.source ?? null,
  p_campaign: filters.campaign ?? null,
  p_email_status: filters.emailStatus ?? null,
  p_converted: filters.converted ?? null,
  p_date_from: filters.dateFrom ?? null,
  p_date_to: filters.dateTo ?? null,
});

export const getWaitlistData = async (filters: WaitlistFilters) => {
  await requireAdminPermission("waitlist.read");
  const loadPage = async (page: number) =>
    parseRpcResult(
      waitlistRowsSchema,
      await callAdminRpc("admin_list_waitlist", {
        ...waitlistFilterRpcArgs(filters),
        p_sort: filters.sort,
        p_page: page,
        p_page_size: filters.pageSize,
      }),
    );
  let page = filters.page;
  let rows = await loadPage(page);

  if (!rows.length && page > 1) {
    page = 1;
    rows = await loadPage(page);
  }

  const total = rows.at(0)?.total_count ?? 0;

  return {
    items: rows,
    total,
    page,
    pageSize: filters.pageSize,
    totalPages: total ? Math.ceil(total / filters.pageSize) : 0,
  };
};

export const getWaitlistLead = async (id: string) => {
  await requireAdminPermission("waitlist.read");
  const raw = await callAdminRpc("admin_get_waitlist_lead", { p_signup_id: id });
  return raw === null ? null : parseRpcResult(leadDetailSchema, raw);
};

export const getAnalyticsData = async (dateFrom?: string, dateTo?: string) => {
  await requireAdminPermission("analytics.read");
  return parseRpcResult(
    analyticsSchema,
    await callAdminRpc("admin_get_waitlist_analytics", {
      p_date_from: dateFrom ?? null,
      p_date_to: dateTo ?? null,
    }),
  );
};

export const getReferralData = async (dateFrom?: string, dateTo?: string) => {
  await requireAdminPermission("referrals.read");
  return parseRpcResult(
    referralsSchema,
    await callAdminRpc("admin_get_referral_analytics", {
      p_date_from: dateFrom ?? null,
      p_date_to: dateTo ?? null,
      p_limit: 25,
      p_offset: 0,
    }),
  );
};

export interface AuditFilters {
  actor?: string;
  action?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

export const getAuditData = async (filters: AuditFilters) => {
  await requireAdminPermission("audit.read");
  const loadPage = async (page: number) =>
    parseRpcResult(
      auditRowsSchema,
      await callAdminRpc("admin_list_audit_logs", {
        p_actor_member_id: filters.actor ?? null,
        p_action: filters.action ?? null,
        p_target_type: filters.targetType ?? null,
        p_target_id: null,
        p_date_from: filters.dateFrom ?? null,
        p_date_to: filters.dateTo ?? null,
        p_page: page,
        p_page_size: filters.pageSize,
      }),
    );
  let page = filters.page;
  let rows = await loadPage(page);

  if (!rows.length && page > 1) {
    page = 1;
    rows = await loadPage(page);
  }

  const total = rows.at(0)?.total_count ?? 0;

  return {
    items: rows,
    total,
    page,
    pageSize: filters.pageSize,
    totalPages: total ? Math.ceil(total / filters.pageSize) : 0,
  };
};

export const getAdminMembers = async () => {
  await requireAdminPermission("admins.read");
  return parseRpcResult(
    membersSchema,
    await callAdminRpc("admin_list_members", {
      p_search: null,
      p_role: null,
      p_status: null,
      p_page: 1,
      p_page_size: 100,
    }),
  );
};

const authorizedList = async <Output>(
  permission: AdminPermission,
  rpcName: string,
  schema: z.ZodType<Output>,
) => {
  await requireAdminPermission(permission);
  return parseRpcResult(schema, await callAdminRpc(rpcName));
};

export const getFeatureFlags = () =>
  authorizedList(
    "feature_flags.read",
    "admin_list_feature_flags",
    flagsSchema,
  );

export const getApplicationSettings = () =>
  authorizedList(
    "settings.read",
    "admin_list_application_settings",
    settingsSchema,
  );
