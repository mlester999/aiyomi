import "server-only";

import type { Database } from "@aiyomi/database";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "@/lib/env";
import { adminAuthCookieOptions } from "@/lib/supabase/cookie-options";

const createClient = async (requireCookieWrites: boolean) => {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookieOptions: adminAuthCookieOptions,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        if (requireCookieWrites) {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
          return;
        }

        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Server Components cannot write cookies. The proxy refresh path does.
        }
      },
    },
  });
};

export const createAdminSupabaseClient = () => createClient(false);

export const createAdminSupabaseActionClient = () => createClient(true);
