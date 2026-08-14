import "server-only";

import type { Database } from "@aiyomi/database";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/env";
import { adminAuthCookieOptions } from "@/lib/supabase/cookie-options";

interface PendingCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

export const createAdminSupabaseRouteClient = async () => {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicConfig();
  let pendingCookies: PendingCookie[] = [];
  let pendingHeaders: Record<string, string> = {};

  const client = createServerClient<Database>(url, publishableKey, {
    cookieOptions: adminAuthCookieOptions,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet, headersToSet) => {
        pendingCookies = cookiesToSet;
        pendingHeaders = headersToSet;
      },
    },
  });

  const applyAuthResponse = (response: NextResponse) => {
    for (const [name, value] of Object.entries(pendingHeaders)) {
      response.headers.set(name, value);
    }

    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  };

  return { applyAuthResponse, client };
};
