import { NextResponse } from "next/server";

import { createAdminSupabaseRouteClient } from "@/lib/supabase/route";

const safeNextPath = (value: string | null) => {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }

  return value;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const { applyAuthResponse, client } =
      await createAdminSupabaseRouteClient();
    const { error } = await client.auth.exchangeCodeForSession(code);

    if (!error) {
      return applyAuthResponse(
        NextResponse.redirect(
          new URL(safeNextPath(url.searchParams.get("next")), url),
        ),
      );
    }
  }

  return NextResponse.redirect(new URL("/login?error=reset-link", url));
}
