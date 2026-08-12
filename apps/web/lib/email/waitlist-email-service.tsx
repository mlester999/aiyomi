import "server-only";

import { brandConfig } from "@aiyomi/config";
import { Resend } from "resend";
import { WaitlistConfirmationEmail } from "../../emails/waitlist-confirmation";
import type {
  WaitlistEmailReceipt,
  WaitlistEmailService,
  WaitlistSignupRecord,
} from "../waitlist/contracts";
import { withTimeout } from "../waitlist/promise-timeout";

const DEFAULT_PROVIDER_TIMEOUT_MS = 5_000;

export class NoopWaitlistEmailService implements WaitlistEmailService {
  async deliverConfirmation(): Promise<WaitlistEmailReceipt> {
    return {};
  }
}

export interface ResendWaitlistEmailServiceOptions {
  resend: Resend;
  from: string;
  audienceId?: string;
  now?: () => Date;
  providerTimeoutMs?: number;
}

export class ResendWaitlistEmailService implements WaitlistEmailService {
  private readonly now: () => Date;
  private readonly providerTimeoutMs: number;

  constructor(private readonly options: ResendWaitlistEmailServiceOptions) {
    this.now = options.now ?? (() => new Date());
    this.providerTimeoutMs =
      options.providerTimeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
  }

  async deliverConfirmation(
    signup: WaitlistSignupRecord,
  ): Promise<WaitlistEmailReceipt> {
    const audienceResult =
      signup.marketingConsent && this.options.audienceId
        ? await this.synchronizeAudience(signup)
        : { contactId: undefined, failed: false };

    const { error } = await withTimeout(
      this.options.resend.emails.send({
        from: this.options.from,
        to: signup.email,
        subject: "You're on the Aiyomi waitlist 🌱",
        react: (
          <WaitlistConfirmationEmail
            firstName={signup.firstName}
            siteUrl={brandConfig.siteUrl}
          />
        ),
      }),
      this.providerTimeoutMs,
    );

    if (error) {
      throw new Error("Resend could not deliver the waitlist confirmation.", {
        cause: error,
      });
    }

    return {
      resendContactId: audienceResult.contactId,
      confirmationSentAt: this.now().toISOString(),
      audienceSyncFailed: audienceResult.failed,
    };
  }

  private async synchronizeAudience(
    signup: WaitlistSignupRecord,
  ): Promise<{ contactId: string | undefined; failed: boolean }> {
    if (!this.options.audienceId) {
      return { contactId: undefined, failed: false };
    }

    try {
      const { data, error } = await withTimeout(
        this.options.resend.contacts.create({
          audienceId: this.options.audienceId,
          email: signup.email,
          firstName: signup.firstName,
          unsubscribed: false,
        }),
        this.providerTimeoutMs,
      );

      return {
        contactId: error ? undefined : data?.id,
        failed: Boolean(error),
      };
    } catch {
      return { contactId: undefined, failed: true };
    }
  }
}

export const createWaitlistEmailServiceFromEnvironment =
  (): WaitlistEmailService => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM_EMAIL?.trim();

    if (!apiKey || !from) {
      return new NoopWaitlistEmailService();
    }

    return new ResendWaitlistEmailService({
      resend: new Resend(apiKey),
      from,
      audienceId: process.env.RESEND_AUDIENCE_ID?.trim() || undefined,
    });
  };
