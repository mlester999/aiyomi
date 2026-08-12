import type { WaitlistSignupInput } from "@aiyomi/types";

export const createWaitlistSignupInput = (
  overrides: Partial<WaitlistSignupInput> = {},
): WaitlistSignupInput => ({
  email: "friend@example.com",
  platformInterest: "both",
  marketingConsent: true,
  website: "",
  source: "landing_page",
  ...overrides,
});

export const fixedIsoDate = "2026-08-11T12:00:00.000Z";
