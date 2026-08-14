import type { Database } from "@aiyomi/database";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "@/lib/env";
import { adminAuthCookieOptions } from "@/lib/supabase/cookie-options";

const protectedPrefixes = [
  "/dashboard",
  "/waitlist",
  "/analytics",
  "/referrals",
  "/admins",
  "/feature-flags",
  "/settings",
  "/audit-logs",
  "/api/export",
] as const;

const isProtectedPath = (pathname: string) =>
  protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export const refreshAdminSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });
  let pendingCookies: Array<{
    name: string;
    value: string;
    options: CookieOptions;
  }> = [];
  let pendingHeaders: Record<string, string> = {};

  const applyAuthState = (nextResponse: NextResponse) => {
    for (const [name, value] of Object.entries(pendingHeaders)) {
      nextResponse.headers.set(name, value);
    }

    for (const cookie of pendingCookies) {
      nextResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return nextResponse;
  };

  let config: ReturnType<typeof getSupabasePublicConfig>;

  try {
    config = getSupabasePublicConfig();
  } catch {
    if (isProtectedPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login?reason=config", request.url));
    }

    return response;
  }

  const supabase = createServerClient<Database>(
    config.url,
    config.publishableKey,
    {
      cookieOptions: adminAuthCookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headersToSet) => {
          pendingCookies = cookiesToSet;
          pendingHeaders = headersToSet;

          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value);
          }

          response = applyAuthState(NextResponse.next({ request }));
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();

  if (
    isProtectedPath(request.nextUrl.pathname) &&
    (error || !data?.claims?.sub)
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return applyAuthState(NextResponse.redirect(loginUrl));
  }

  return response;
};
