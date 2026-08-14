import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { createCsv } from "@/lib/admin/csv";
import {
  exportRowsSchema,
  waitlistFiltersSchema,
} from "@/lib/admin/schemas";
import { AdminAuthorizationError, authorizeAdminPermission } from "@/lib/auth/authorization";
import { requireDeploymentEnvironment } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const invalidRequest = (message: string, requestId: string, status = 400) =>
  NextResponse.json(
    { ok: false, error: message },
    {
      status,
      headers: { "Cache-Control": "private, no-store", "X-Request-Id": requestId },
    },
  );

export async function POST(request: Request) {
  const requestId = randomUUID();
  const requestUrl = new URL(request.url);

  if (request.headers.get("origin") !== requestUrl.origin) {
    return invalidRequest("The export request was rejected.", requestId, 403);
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/x-www-form-urlencoded") && !contentType.startsWith("multipart/form-data")) {
    return invalidRequest("The export request format is invalid.", requestId, 415);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return invalidRequest("The export filters are invalid.", requestId);
  }

  const filters = waitlistFiltersSchema.safeParse(Object.fromEntries(formData));
  if (!filters.success) {
    return invalidRequest("The export filters are invalid.", requestId);
  }

  try {
    const { client } = await authorizeAdminPermission("waitlist.export");
    const { data, error } = await (
      client as unknown as {
        rpc: (
          name: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      }
    ).rpc("admin_export_waitlist", {
      p_search: filters.data.query ?? null,
      p_status: filters.data.status ?? null,
      p_platform: filters.data.platform ?? null,
      p_source: filters.data.source ?? null,
      p_campaign: filters.data.campaign ?? null,
      p_email_status: filters.data.emailStatus ?? null,
      p_converted: filters.data.converted ?? null,
      p_date_from: filters.data.dateFrom ?? null,
      p_date_to: filters.data.dateTo ?? null,
      p_limit: 5000,
      p_request_id: requestId,
      p_expected_environment: requireDeploymentEnvironment(),
    });

    if (error) throw new Error(error.message);

    const rows = exportRowsSchema.parse(data);
    const csv = createCsv(
      [
        "lead_id",
        "email",
        "first_name",
        "platform_interest",
        "status",
        "source",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "referral_code",
        "referred_by_code",
        "locale",
        "marketing_consent",
        "consent_at",
        "confirmation_send_requested",
        "confirmation_sent_at",
        "converted",
        "converted_at",
        "created_at",
        "updated_at",
      ],
      rows.map((row) => [
        row.id,
        row.email,
        row.first_name,
        row.platform_interest,
        row.status,
        row.source,
        row.utm_source,
        row.utm_medium,
        row.utm_campaign,
        row.utm_content,
        row.utm_term,
        row.referral_code,
        row.referred_by_code,
        row.locale,
        row.marketing_consent,
        row.consent_at,
        row.confirmation_send_requested,
        row.confirmation_sent_at,
        row.converted,
        row.converted_at,
        row.created_at,
        row.updated_at,
      ]),
    );

    console.info("Admin waitlist export completed", {
      requestId,
      rowCount: rows.length,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="aiyomi-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return invalidRequest(
        error.status === 401 ? "Authentication required." : "Export permission denied.",
        requestId,
        error.status,
      );
    }

    console.error("Admin waitlist export failed", { requestId });
    return invalidRequest("The export could not be created.", requestId, 500);
  }
}
