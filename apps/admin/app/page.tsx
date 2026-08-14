import { redirect } from "next/navigation";

import { getDefaultAdminPath } from "@/lib/admin/contracts";
import { getCurrentAdmin } from "@/lib/auth/authorization";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const client = await createAdminSupabaseClient();
  const { data, error } = await client.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const member = await getCurrentAdmin();

  if (!member) {
    redirect("/access-denied");
  }

  redirect(getDefaultAdminPath(member));
}
