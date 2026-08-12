import {
  normalizeEmail,
  parseReferralCode,
  parseWaitlistAttribution,
  waitlistSignupSchema,
} from "@aiyomi/schemas";
import { describe, expect, it } from "vitest";

const validSubmission = {
  email: "friend@example.com",
  platformInterest: "both",
  marketingConsent: true,
  website: "",
  source: "landing_page",
} as const;

describe("waitlistSignupSchema", () => {
  it("normalizes email before returning validated data", () => {
    const result = waitlistSignupSchema.parse({
      ...validSubmission,
      email: "  Friend+Early@Example.COM ",
    });

    expect(result.email).toBe("friend+early@example.com");
    expect(normalizeEmail(" HELLO@EXAMPLE.COM ")).toBe("hello@example.com");
  });

  it.each(["ios", "android", "both"])(
    "accepts the supported %s platform",
    (platformInterest) => {
      expect(
        waitlistSignupSchema.safeParse({
          ...validSubmission,
          platformInterest,
        }).success,
      ).toBe(true);
    },
  );

  it("rejects unsupported platforms and malformed email", () => {
    expect(
      waitlistSignupSchema.safeParse({
        ...validSubmission,
        platformInterest: "web",
      }).success,
    ).toBe(false);
    expect(
      waitlistSignupSchema.safeParse({
        ...validSubmission,
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("trims optional names and turns blank optional values into undefined", () => {
    const result = waitlistSignupSchema.parse({
      ...validSubmission,
      firstName: "  Maya  ",
      utmTerm: " ",
      referralCode: "",
    });

    expect(result.firstName).toBe("Maya");
    expect(result.utmTerm).toBeUndefined();
    expect(result.referralCode).toBeUndefined();
  });

  it("drops unsafe attribution supplied directly to the endpoint", () => {
    const result = waitlistSignupSchema.parse({
      ...validSubmission,
      utmCampaign: "<script>alert(1)</script>",
      utmContent: "a".repeat(101),
      referralCode: "bad referral code",
    });

    expect(result.utmCampaign).toBeUndefined();
    expect(result.utmContent).toBeUndefined();
    expect(result.referralCode).toBeUndefined();
  });

  it("rejects unknown request keys", () => {
    expect(
      waitlistSignupSchema.safeParse({
        ...validSubmission,
        status: "invited",
      }).success,
    ).toBe(false);
  });
});

describe("waitlist attribution parsing", () => {
  it("parses valid UTM fields and normalizes referral codes", () => {
    const params = new URLSearchParams({
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "cozy launch",
      utm_content: "companion-card_1",
      utm_term: "better+days",
      ref: "leaf_42",
    });

    expect(parseWaitlistAttribution(params)).toEqual({
      source: "referral",
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "cozy launch",
      utmContent: "companion-card_1",
      utmTerm: "better+days",
      referralCode: "LEAF_42",
    });
  });

  it("drops unsafe or oversized tracking values", () => {
    const params = new URLSearchParams({
      utm_source: "<script>",
      utm_campaign: "x".repeat(101),
      ref: "!bad!",
    });

    expect(parseWaitlistAttribution(params)).toEqual({
      source: "landing_page",
      utmSource: undefined,
      utmMedium: undefined,
      utmCampaign: undefined,
      utmContent: undefined,
      utmTerm: undefined,
      referralCode: undefined,
    });
  });

  it("accepts only constrained referral codes", () => {
    expect(parseReferralCode("  sprout-123 ")).toBe("SPROUT-123");
    expect(parseReferralCode("ab")).toBeUndefined();
    expect(parseReferralCode("code with spaces")).toBeUndefined();
  });
});
