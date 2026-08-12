import "server-only";

import type { Database } from "@aiyomi/database";
import { createClient } from "@supabase/supabase-js";

export class SupabaseServerConfigurationError extends Error {
  constructor() {
    super("Hosted Supabase server credentials are not configured.");
    this.name = "SupabaseServerConfigurationError";
  }
}

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new SupabaseServerConfigurationError();
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    db: { timeout: 10_000 },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: { "X-Client-Info": "aiyomi-web-waitlist" },
    },
  });
};
