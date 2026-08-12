import "server-only";

import type { Database } from "@aiyomi/database";
import { createServerSupabaseClient } from "../supabase/server";
import type {
  InsertWaitlistSignupResult,
  NewWaitlistSignup,
  WaitlistDeliveryMetadata,
  WaitlistRepository,
  WaitlistSignupRecord,
} from "./contracts";

export class WaitlistRepositoryError extends Error {
  constructor(options?: ErrorOptions) {
    super("Waitlist repository operation failed.", options);
    this.name = "WaitlistRepositoryError";
  }
}

type SupabaseServerClient = ReturnType<typeof createServerSupabaseClient>;
type WaitlistSignupUpdate =
  Database["public"]["Tables"]["waitlist_signups"]["Update"];

interface SignupSelection {
  id: string;
  email: string;
  first_name: string | null;
  platform_interest: WaitlistSignupRecord["platformInterest"];
  marketing_consent: boolean;
}

const mapSignup = (row: SignupSelection): WaitlistSignupRecord => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name ?? undefined,
  platformInterest: row.platform_interest,
  marketingConsent: row.marketing_consent,
});

export class SupabaseWaitlistRepository implements WaitlistRepository {
  constructor(private readonly getClient: () => SupabaseServerClient) {}

  async findReferrerIdByCode(code: string): Promise<string | undefined> {
    const { data, error } = await this.getClient()
      .from("waitlist_signups")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (error) {
      throw new WaitlistRepositoryError({ cause: error });
    }

    return data?.id;
  }

  async insert(
    input: NewWaitlistSignup,
  ): Promise<InsertWaitlistSignupResult> {
    const { data, error } = await this.getClient()
      .from("waitlist_signups")
      .insert({
        email: input.email,
        first_name: input.firstName ?? null,
        platform_interest: input.platformInterest,
        source: input.source,
        utm_source: input.utmSource ?? null,
        utm_medium: input.utmMedium ?? null,
        utm_campaign: input.utmCampaign ?? null,
        utm_content: input.utmContent ?? null,
        utm_term: input.utmTerm ?? null,
        referred_by: input.referredBy ?? null,
        locale: input.locale ?? null,
        marketing_consent: input.marketingConsent,
        consent_at: input.consentAt ?? null,
      })
      .select(
        "id,email,first_name,platform_interest,marketing_consent",
      )
      .single();

    if (error?.code === "23505") {
      return { kind: "duplicate" };
    }

    if (error || !data) {
      throw new WaitlistRepositoryError({ cause: error });
    }

    return { kind: "created", signup: mapSignup(data as SignupSelection) };
  }

  async updateDeliveryMetadata(
    signupId: string,
    metadata: WaitlistDeliveryMetadata,
  ): Promise<void> {
    const values: WaitlistSignupUpdate = {};

    if (metadata.resendContactId) {
      values.resend_contact_id = metadata.resendContactId;
    }

    if (metadata.confirmationSentAt) {
      values.confirmation_sent_at = metadata.confirmationSentAt;
    }

    if (Object.keys(values).length === 0) {
      return;
    }

    const { error } = await this.getClient()
      .from("waitlist_signups")
      .update(values)
      .eq("id", signupId);

    if (error) {
      throw new WaitlistRepositoryError({ cause: error });
    }
  }
}

export const createSupabaseWaitlistRepository = () => {
  let client: SupabaseServerClient | undefined;

  return new SupabaseWaitlistRepository(() => {
    client ??= createServerSupabaseClient();
    return client;
  });
};
