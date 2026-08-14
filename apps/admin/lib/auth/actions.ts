"use server";

import { redirect } from "next/navigation";

import { getAdminUrl } from "@/lib/env";
import { createAdminSupabaseActionClient } from "@/lib/supabase/server";

const safeNextPath = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//") || value.includes("\\")) {
    return "/";
  }

  return value;
};

const encodeMessage = (message: string) => encodeURIComponent(message);

export const loginAction = async (formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safeNextPath(formData.get("next"));

  if (typeof email !== "string" || typeof password !== "string") {
    redirect(`/login?error=${encodeMessage("Enter your email and password.")}`);
  }

  const supabase = await createAdminSupabaseActionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    redirect(
      `/login?error=${encodeMessage("We could not sign you in. Check your details and try again.")}`,
    );
  }

  redirect(next);
};

export const logoutAction = async () => {
  const supabase = await createAdminSupabaseActionClient();
  await supabase.auth.signOut();
  redirect("/login?signedOut=1");
};

export const requestPasswordResetAction = async (formData: FormData) => {
  const email = formData.get("email");

  if (typeof email === "string" && email.trim()) {
    const supabase = await createAdminSupabaseActionClient();

    try {
      const adminUrl = getAdminUrl();
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${adminUrl}/auth/callback?next=/update-password`,
      });
    } catch {
      // Return the same response so account existence and configuration stay private.
    }
  }

  redirect("/forgot-password?sent=1");
};

export const updatePasswordAction = async (formData: FormData) => {
  const password = formData.get("password");
  const confirmation = formData.get("passwordConfirmation");

  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password !== confirmation
  ) {
    redirect(
      `/update-password?error=${encodeMessage("Use at least 12 characters and make both entries match.")}`,
    );
  }

  const supabase = await createAdminSupabaseActionClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      `/update-password?error=${encodeMessage("That reset link is no longer valid. Request a new one and try again.")}`,
    );
  }

  redirect("/");
};
