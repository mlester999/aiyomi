import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  WaitlistEmailService,
  WaitlistPostResponseScheduler,
  WaitlistRateLimiter,
  WaitlistRepository,
} from "./contracts";
import {
  WaitlistRateLimitError,
  WaitlistService,
  WaitlistUnavailableError,
  WaitlistValidationError,
} from "./service";

const NOW = new Date("2026-08-11T12:00:00.000Z");

const validSubmission = {
  email: " Friend@Example.COM ",
  firstName: "Maya",
  platformInterest: "ios",
  marketingConsent: true,
  website: "",
  source: "landing_page",
  utmSource: "instagram",
  referralCode: "leaf_42",
  locale: "en-PH",
} as const;

describe("WaitlistService", () => {
  const findReferrerIdByCode = vi.fn();
  const insert = vi.fn();
  const updateDeliveryMetadata = vi.fn();
  const deliverConfirmation = vi.fn();
  const consume = vi.fn();
  const schedule = vi.fn();
  const onNonCriticalError = vi.fn();
  const scheduledTasks: Array<() => Promise<void>> = [];

  const repository: WaitlistRepository = {
    findReferrerIdByCode,
    insert,
    updateDeliveryMetadata,
  };
  const emailService: WaitlistEmailService = { deliverConfirmation };
  const postResponseScheduler: WaitlistPostResponseScheduler = { schedule };
  const rateLimiter: WaitlistRateLimiter = { consume };

  const runScheduledTasks = async () => {
    await Promise.all(scheduledTasks.splice(0).map((task) => task()));
  };

  const createService = () =>
    new WaitlistService({
      repository,
      emailService,
      postResponseScheduler,
      rateLimiter,
      now: () => NOW,
      onNonCriticalError,
    });

  beforeEach(() => {
    vi.resetAllMocks();
    scheduledTasks.splice(0);
    schedule.mockImplementation((task) => {
      scheduledTasks.push(task);
    });
    consume.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    findReferrerIdByCode.mockResolvedValue("referrer-id");
    insert.mockResolvedValue({
      kind: "created",
      signup: {
        id: "signup-id",
        email: "friend@example.com",
        firstName: "Maya",
        platformInterest: "ios",
        marketingConsent: true,
      },
    });
    deliverConfirmation.mockResolvedValue({
      resendContactId: "contact-id",
      confirmationSentAt: NOW.toISOString(),
    });
    updateDeliveryMetadata.mockResolvedValue(undefined);
  });

  it("normalizes, attributes, stores, and confirms a valid signup", async () => {
    await expect(
      createService().join(validSubmission, { rateLimitKey: "ip-hash" }),
    ).resolves.toEqual({ alreadyJoined: false });

    expect(consume).toHaveBeenCalledWith("ip-hash");
    expect(findReferrerIdByCode).toHaveBeenCalledWith("LEAF_42");
    expect(insert).toHaveBeenCalledWith({
      email: "friend@example.com",
      firstName: "Maya",
      platformInterest: "ios",
      source: "referral",
      utmSource: "instagram",
      utmMedium: undefined,
      utmCampaign: undefined,
      utmContent: undefined,
      utmTerm: undefined,
      referredBy: "referrer-id",
      locale: "en-PH",
      marketingConsent: true,
      consentAt: NOW.toISOString(),
    });
    expect(schedule).toHaveBeenCalledOnce();
    expect(deliverConfirmation).not.toHaveBeenCalled();

    await runScheduledTasks();

    expect(deliverConfirmation).toHaveBeenCalledOnce();
    expect(updateDeliveryMetadata).toHaveBeenCalledWith("signup-id", {
      resendContactId: "contact-id",
      confirmationSentAt: NOW.toISOString(),
    });
  });

  it("returns friendly duplicate state without sending another email", async () => {
    insert.mockResolvedValue({ kind: "duplicate" });

    await expect(
      createService().join(
        { ...validSubmission, referralCode: undefined },
        { rateLimitKey: "ip-hash" },
      ),
    ).resolves.toEqual({ alreadyJoined: true });

    expect(deliverConfirmation).not.toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
    expect(updateDeliveryMetadata).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot submissions without storing them", async () => {
    await expect(
      createService().join(
        { ...validSubmission, website: "https://spam.example" },
        { rateLimitKey: "ip-hash" },
      ),
    ).resolves.toEqual({ alreadyJoined: false });

    expect(insert).not.toHaveBeenCalled();
    expect(deliverConfirmation).not.toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
  });

  it("silently accepts implausibly fast submissions without storing them", async () => {
    await expect(
      createService().join(
        { ...validSubmission, formStartedAt: NOW.getTime() - 100 },
        { rateLimitKey: "ip-hash" },
      ),
    ).resolves.toEqual({ alreadyJoined: false });

    expect(insert).not.toHaveBeenCalled();
  });

  it("does not drop a signup when the client clock is ahead", async () => {
    await expect(
      createService().join(
        { ...validSubmission, formStartedAt: NOW.getTime() + 60_000 },
        { rateLimitKey: "ip-hash" },
      ),
    ).resolves.toEqual({ alreadyJoined: false });

    expect(insert).toHaveBeenCalledOnce();
  });

  it("returns success when optional email delivery fails", async () => {
    deliverConfirmation.mockRejectedValue(new Error("provider unavailable"));

    await expect(
      createService().join(validSubmission, { rateLimitKey: "ip-hash" }),
    ).resolves.toEqual({ alreadyJoined: false });

    expect(deliverConfirmation).not.toHaveBeenCalled();
    await runScheduledTasks();

    expect(onNonCriticalError).toHaveBeenCalledOnce();
    expect(updateDeliveryMetadata).not.toHaveBeenCalled();
  });

  it("returns success when post-response scheduling is unavailable", async () => {
    schedule.mockImplementation(() => {
      throw new Error("scheduler unavailable");
    });

    await expect(
      createService().join(validSubmission, { rateLimitKey: "ip-hash" }),
    ).resolves.toEqual({ alreadyJoined: false });

    expect(onNonCriticalError).toHaveBeenCalledOnce();
    expect(deliverConfirmation).not.toHaveBeenCalled();
  });

  it("records an audience sync warning while preserving email metadata", async () => {
    deliverConfirmation.mockResolvedValue({
      confirmationSentAt: NOW.toISOString(),
      audienceSyncFailed: true,
    });

    await expect(
      createService().join(validSubmission, { rateLimitKey: "ip-hash" }),
    ).resolves.toEqual({ alreadyJoined: false });

    await runScheduledTasks();

    expect(onNonCriticalError).toHaveBeenCalledOnce();
    expect(updateDeliveryMetadata).toHaveBeenCalledWith("signup-id", {
      confirmationSentAt: NOW.toISOString(),
      resendContactId: undefined,
    });
  });

  it("does not attribute an unknown referral code", async () => {
    findReferrerIdByCode.mockResolvedValue(undefined);

    await createService().join(validSubmission, { rateLimitKey: "ip-hash" });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ source: "landing_page", referredBy: undefined }),
    );
  });

  it("rejects invalid input before storage", async () => {
    await expect(
      createService().join(
        { ...validSubmission, platformInterest: "web" },
        { rateLimitKey: "ip-hash" },
      ),
    ).rejects.toBeInstanceOf(WaitlistValidationError);

    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects requests after the throttle is exhausted", async () => {
    consume.mockReturnValue({ allowed: false, retryAfterSeconds: 90 });

    const error = await createService()
      .join(validSubmission, { rateLimitKey: "ip-hash" })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(WaitlistRateLimitError);
    expect(error).toMatchObject({ retryAfterSeconds: 90 });

    expect(insert).not.toHaveBeenCalled();
  });

  it("wraps repository failures in a safe service error", async () => {
    insert.mockRejectedValue(new Error("database detail"));

    await expect(
      createService().join(validSubmission, { rateLimitKey: "ip-hash" }),
    ).rejects.toBeInstanceOf(WaitlistUnavailableError);
  });
});
