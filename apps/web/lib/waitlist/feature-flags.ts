import "server-only";

import { createServerSupabaseClient } from "../supabase/server";

export class WaitlistFlagUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super("The waitlist feature flag could not be read.", options);
    this.name = "WaitlistFlagUnavailableError";
  }
}

export const isWaitlistEnabled = async () => {
  const { data, error } = await createServerSupabaseClient().rpc(
    "is_waitlist_enabled",
  );

  if (error || typeof data !== "boolean") {
    throw new WaitlistFlagUnavailableError({ cause: error });
  }

  return data;
};
