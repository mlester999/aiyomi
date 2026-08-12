import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import type {
  RateLimitDecision,
  WaitlistRateLimiter,
} from "./contracts";

interface RateLimitBucket {
  attempts: number;
  resetsAt: number;
}

const MAX_BUCKETS = 10_000;
const ephemeralSalt = randomBytes(32).toString("hex");

export class InMemoryWaitlistRateLimiter implements WaitlistRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(
    private readonly maximumAttempts: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  consume(key: string): RateLimitDecision {
    const currentTime = this.now();
    this.purgeExpired(currentTime);
    const existing = this.buckets.get(key);

    if (!existing) {
      this.makeRoom();
      this.buckets.set(key, {
        attempts: 1,
        resetsAt: currentTime + this.windowMs,
      });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (existing.attempts >= this.maximumAttempts) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.resetsAt - currentTime) / 1_000),
        ),
      };
    }

    existing.attempts += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private purgeExpired(currentTime: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetsAt <= currentTime) {
        this.buckets.delete(key);
      }
    }
  }

  private makeRoom(): void {
    if (this.buckets.size < MAX_BUCKETS) {
      return;
    }

    const oldestKey = this.buckets.keys().next().value as string | undefined;
    if (oldestKey) {
      this.buckets.delete(oldestKey);
    }
  }
}

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  maximum: number,
) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback;
};

export const createWaitlistRateLimiterFromEnvironment = () => {
  const maximumAttempts = parsePositiveInteger(
    process.env.WAITLIST_RATE_LIMIT_MAX,
    5,
    100,
  );
  const windowSeconds = parsePositiveInteger(
    process.env.WAITLIST_RATE_LIMIT_WINDOW_SECONDS,
    600,
    86_400,
  );

  return new InMemoryWaitlistRateLimiter(
    maximumAttempts,
    windowSeconds * 1_000,
  );
};

export const createRateLimitKey = (headers: Headers): string => {
  const forwardedAddress = headers
    .get("x-forwarded-for")
    ?.split(",", 1)[0]
    ?.trim()
    .slice(0, 64);
  const realAddress = headers.get("x-real-ip")?.trim().slice(0, 64);
  const userAgent = headers.get("user-agent")?.trim().slice(0, 160);
  const identifier = forwardedAddress || realAddress || userAgent || "unknown";
  const configuredSalt = process.env.WAITLIST_IP_HASH_SALT?.trim();
  const salt =
    configuredSalt && configuredSalt.length >= 16
      ? configuredSalt
      : ephemeralSalt;

  return createHmac("sha256", salt).update(identifier).digest("hex");
};
