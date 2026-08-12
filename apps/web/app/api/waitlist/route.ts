import { randomUUID } from "node:crypto";
import { after, NextResponse } from "next/server";
import { createWaitlistEmailServiceFromEnvironment } from "@/lib/email/waitlist-email-service";
import {
  createRateLimitKey,
  createWaitlistRateLimiterFromEnvironment,
} from "@/lib/waitlist/rate-limit";
import { WaitlistService } from "@/lib/waitlist/service";
import {
  WaitlistRateLimitError,
  WaitlistUnavailableError,
  WaitlistValidationError,
} from "@/lib/waitlist/service";
import { createSupabaseWaitlistRepository } from "@/lib/waitlist/supabase-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAXIMUM_REQUEST_CHARACTERS = 16_384;
const rateLimiter = createWaitlistRateLimiterFromEnvironment();
let service: WaitlistService | undefined;

const getWaitlistService = () => {
  service ??= new WaitlistService({
    repository: createSupabaseWaitlistRepository(),
    emailService: createWaitlistEmailServiceFromEnvironment(),
    postResponseScheduler: { schedule: (task) => after(task) },
    rateLimiter,
  });

  return service;
};

type WaitlistLogCategory =
  | "accepted"
  | "invalid_request"
  | "rate_limited"
  | "storage_unavailable"
  | "email_deferred"
  | "unexpected";

const logWaitlistEvent = (
  requestId: string,
  category: WaitlistLogCategory,
  startedAt: number,
  level: "info" | "warn" | "error" = "info",
) => {
  const entry = JSON.stringify({
    event: "waitlist_submission",
    requestId,
    category,
    durationMs: Date.now() - startedAt,
  });

  console[level](entry);
};

const errorResponse = (
  error: string,
  status: number,
  requestId: string,
  headers?: HeadersInit,
) =>
  NextResponse.json(
    { ok: false as const, error },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
        ...headers,
      },
    },
  );

export async function POST(request: Request) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const contentType = request.headers.get("content-type")?.toLowerCase();

  if (contentType?.split(";", 1)[0]?.trim() !== "application/json") {
    logWaitlistEvent(requestId, "invalid_request", startedAt, "warn");
    return errorResponse("Send the form as JSON.", 415, requestId);
  }

  const declaredLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );

  if (declaredLength > MAXIMUM_REQUEST_CHARACTERS) {
    logWaitlistEvent(requestId, "invalid_request", startedAt, "warn");
    return errorResponse(
      "This form submission is too large.",
      413,
      requestId,
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    logWaitlistEvent(requestId, "invalid_request", startedAt, "warn");
    return errorResponse(
      "We could not read that form submission.",
      400,
      requestId,
    );
  }

  if (!rawBody || rawBody.length > MAXIMUM_REQUEST_CHARACTERS) {
    logWaitlistEvent(requestId, "invalid_request", startedAt, "warn");
    return errorResponse(
      "This form submission is invalid.",
      400,
      requestId,
    );
  }

  let input: unknown;

  try {
    input = JSON.parse(rawBody) as unknown;
  } catch {
    logWaitlistEvent(requestId, "invalid_request", startedAt, "warn");
    return errorResponse(
      "This form submission is invalid.",
      400,
      requestId,
    );
  }

  try {
    await getWaitlistService().join(input, {
      rateLimitKey: createRateLimitKey(request.headers),
      onNonCriticalError: () => {
        logWaitlistEvent(requestId, "email_deferred", startedAt, "warn");
      },
    });

    logWaitlistEvent(requestId, "accepted", startedAt);
    return NextResponse.json(
      // Keep new and duplicate submissions externally indistinguishable.
      { ok: true as const, alreadyJoined: false },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
        },
      },
    );
  } catch (error) {
    if (error instanceof WaitlistValidationError) {
      logWaitlistEvent(requestId, "invalid_request", startedAt, "warn");
      return errorResponse(
        "Check your details and try again.",
        400,
        requestId,
      );
    }

    if (error instanceof WaitlistRateLimitError) {
      logWaitlistEvent(requestId, "rate_limited", startedAt, "warn");
      return errorResponse(
        "Too many tries. Please wait a few minutes and try again.",
        429,
        requestId,
        { "Retry-After": String(error.retryAfterSeconds) },
      );
    }

    if (error instanceof WaitlistUnavailableError) {
      logWaitlistEvent(requestId, "storage_unavailable", startedAt, "error");
      return errorResponse(
        "We could not save your spot right now. Please try again soon.",
        503,
        requestId,
      );
    }

    logWaitlistEvent(requestId, "unexpected", startedAt, "error");
    return errorResponse(
      "We could not save your spot right now. Please try again soon.",
      503,
      requestId,
    );
  }
}
