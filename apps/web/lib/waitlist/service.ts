import { waitlistSignupSchema } from "@aiyomi/schemas";
import type {
  NewWaitlistSignup,
  WaitlistEmailService,
  WaitlistPostResponseScheduler,
  WaitlistRateLimiter,
  WaitlistRepository,
} from "./contracts";

const MINIMUM_FORM_COMPLETION_MS = 750;

export class WaitlistValidationError extends Error {
  readonly code = "validation";

  constructor() {
    super("Waitlist submission is invalid.");
    this.name = "WaitlistValidationError";
  }
}

export class WaitlistRateLimitError extends Error {
  readonly code = "rate_limited";

  constructor(readonly retryAfterSeconds: number) {
    super("Waitlist submission rate limit reached.");
    this.name = "WaitlistRateLimitError";
  }
}

export class WaitlistUnavailableError extends Error {
  readonly code = "unavailable";

  constructor(options?: ErrorOptions) {
    super("Waitlist storage is unavailable.", options);
    this.name = "WaitlistUnavailableError";
  }
}

export interface JoinWaitlistContext {
  rateLimitKey: string;
  beforeInsert?: () => Promise<boolean>;
  onNonCriticalError?: (error: unknown) => void;
}

export interface JoinWaitlistResult {
  alreadyJoined: boolean;
}

export interface WaitlistServiceDependencies {
  repository: WaitlistRepository;
  emailService: WaitlistEmailService;
  postResponseScheduler: WaitlistPostResponseScheduler;
  rateLimiter: WaitlistRateLimiter;
  now?: () => Date;
  onNonCriticalError?: (error: unknown) => void;
}

export class WaitlistService {
  private readonly now: () => Date;

  constructor(private readonly dependencies: WaitlistServiceDependencies) {
    this.now = dependencies.now ?? (() => new Date());
  }

  async join(
    rawInput: unknown,
    context: JoinWaitlistContext,
  ): Promise<JoinWaitlistResult> {
    const rateLimit = await this.dependencies.rateLimiter.consume(
      context.rateLimitKey,
    );

    if (!rateLimit.allowed) {
      throw new WaitlistRateLimitError(rateLimit.retryAfterSeconds);
    }

    const parsed = waitlistSignupSchema.safeParse(rawInput);

    if (!parsed.success) {
      throw new WaitlistValidationError();
    }

    const submission = parsed.data;
    const now = this.now();

    if (
      submission.website.trim() !== "" ||
      this.isImplausiblyFast(submission.formStartedAt, now.getTime())
    ) {
      return { alreadyJoined: false };
    }

    try {
      if (context.beforeInsert && !(await context.beforeInsert())) {
        throw new WaitlistPausedError();
      }

      const referredBy = submission.referralCode
        ? await this.dependencies.repository.findReferrerIdByCode(
            submission.referralCode,
          )
        : undefined;

      const signup: NewWaitlistSignup = {
        email: submission.email,
        firstName: submission.firstName,
        platformInterest: submission.platformInterest,
        source: referredBy ? "referral" : submission.source,
        utmSource: submission.utmSource,
        utmMedium: submission.utmMedium,
        utmCampaign: submission.utmCampaign,
        utmContent: submission.utmContent,
        utmTerm: submission.utmTerm,
        referredBy,
        locale: submission.locale,
        marketingConsent: submission.marketingConsent,
        consentAt: submission.marketingConsent ? now.toISOString() : undefined,
      };

      const inserted = await this.dependencies.repository.insert(signup);

      if (inserted.kind === "duplicate") {
        return { alreadyJoined: true };
      }

      this.scheduleConfirmation(
        inserted.signup,
        context.onNonCriticalError ??
          this.dependencies.onNonCriticalError ??
          (() => undefined),
      );
      return { alreadyJoined: false };
    } catch (error) {
      if (
        error instanceof WaitlistValidationError ||
        error instanceof WaitlistRateLimitError ||
        error instanceof WaitlistPausedError
      ) {
        throw error;
      }

      throw new WaitlistUnavailableError({ cause: error });
    }
  }

  private isImplausiblyFast(
    formStartedAt: number | undefined,
    nowMs: number,
  ): boolean {
    if (!formStartedAt) {
      return false;
    }

    const elapsed = nowMs - formStartedAt;
    return elapsed >= 0 && elapsed < MINIMUM_FORM_COMPLETION_MS;
  }

  private async deliverConfirmation(
    signup: Parameters<WaitlistEmailService["deliverConfirmation"]>[0],
    onNonCriticalError: (error: unknown) => void,
  ): Promise<void> {
    try {
      const receipt =
        await this.dependencies.emailService.deliverConfirmation(signup);

      if (receipt.audienceSyncFailed) {
        onNonCriticalError(
          new Error("Waitlist audience synchronization did not complete."),
        );
      }

      if (receipt.resendContactId || receipt.confirmationSentAt) {
        await this.dependencies.repository.updateDeliveryMetadata(
          signup.id,
          {
            resendContactId: receipt.resendContactId,
            confirmationSentAt: receipt.confirmationSentAt,
          },
        );
      }
    } catch (error) {
      onNonCriticalError(error);
    }
  }

  private scheduleConfirmation(
    signup: Parameters<WaitlistEmailService["deliverConfirmation"]>[0],
    onNonCriticalError: (error: unknown) => void,
  ): void {
    try {
      this.dependencies.postResponseScheduler.schedule(() =>
        this.deliverConfirmation(signup, onNonCriticalError),
      );
    } catch (error) {
      onNonCriticalError(error);
    }
  }
}

export class WaitlistPausedError extends Error {
  readonly code = "paused";

  constructor() {
    super("Waitlist submissions are paused.");
    this.name = "WaitlistPausedError";
  }
}
