import type { WaitlistSignup } from "@aiyomi/schemas";

export interface WaitlistSignupRecord {
  id: string;
  email: string;
  firstName?: string;
  platformInterest: WaitlistSignup["platformInterest"];
  marketingConsent: boolean;
}

export interface NewWaitlistSignup {
  email: string;
  firstName?: string;
  platformInterest: WaitlistSignup["platformInterest"];
  source: WaitlistSignup["source"];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referredBy?: string;
  locale?: string;
  marketingConsent: boolean;
  consentAt?: string;
}

export type InsertWaitlistSignupResult =
  | { kind: "created"; signup: WaitlistSignupRecord }
  | { kind: "duplicate" };

export interface WaitlistDeliveryMetadata {
  resendContactId?: string;
  confirmationSentAt?: string;
}

export interface WaitlistRepository {
  findReferrerIdByCode(code: string): Promise<string | undefined>;
  insert(input: NewWaitlistSignup): Promise<InsertWaitlistSignupResult>;
  updateDeliveryMetadata(
    signupId: string,
    metadata: WaitlistDeliveryMetadata,
  ): Promise<void>;
}

export interface WaitlistEmailReceipt {
  resendContactId?: string;
  confirmationSentAt?: string;
  audienceSyncFailed?: boolean;
}

export interface WaitlistEmailService {
  deliverConfirmation(
    signup: WaitlistSignupRecord,
  ): Promise<WaitlistEmailReceipt>;
}

export interface WaitlistPostResponseScheduler {
  schedule(task: () => Promise<void>): void;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface WaitlistRateLimiter {
  consume(key: string): RateLimitDecision | Promise<RateLimitDecision>;
}
