export const WAITLIST_PLATFORM_INTERESTS = ["ios", "android", "both"] as const;

export type WaitlistPlatformInterest =
  (typeof WAITLIST_PLATFORM_INTERESTS)[number];

export const WAITLIST_SOURCES = [
  "landing_page",
  "direct",
  "referral",
  "organic",
  "social",
  "other",
] as const;

export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export const WAITLIST_STATUSES = [
  "pending",
  "confirmed",
  "invited",
  "converted",
  "unsubscribed",
] as const;

export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export interface WaitlistAttribution {
  source: WaitlistSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referralCode?: string;
}

export interface WaitlistSignupInput extends WaitlistAttribution {
  email: string;
  firstName?: string;
  platformInterest: WaitlistPlatformInterest;
  marketingConsent: boolean;
  website: string;
  formStartedAt?: number;
  locale?: string;
}

export type WaitlistApiSuccess = {
  ok: true;
  alreadyJoined: false;
};

export type WaitlistApiError = {
  ok: false;
  error: string;
};

export type WaitlistApiResponse = WaitlistApiSuccess | WaitlistApiError;
