import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { requireSupabase } from "../lib/supabase";
import {
  activateCurrentDeviceRegistration,
  removeCurrentDeviceRegistration,
} from "../notifications/service";
import type { AuthCallbackKind } from "./callback";
import { consumeAuthCallback } from "./consume-callback";
import {
  clearPendingVerificationEmail,
  rememberPendingVerificationEmail,
} from "./pending-verification";
import { signOutAfterDeviceCleanup } from "./sign-out";

WebBrowser.maybeCompleteAuthSession();

const redirectUrl = (flow?: "recovery") => {
  const base = makeRedirectUri({ scheme: "aiyomi", path: "auth/callback" });
  if (!flow) return base;

  const url = new URL(base);
  url.searchParams.set("flow", flow);
  return url.toString();
};

export const authService = {
  async signUp(email: string, password: string) {
    const client = requireSupabase();
    const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
    const result = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: { emailRedirectTo: redirectUrl() },
    });
    if (!result.error && !result.data.session) {
      rememberPendingVerificationEmail(normalizedEmail);
    } else if (!result.error) {
      clearPendingVerificationEmail();
    }
    return result;
  },

  async signIn(email: string, password: string) {
    const result = await requireSupabase().auth.signInWithPassword({
      email: email.trim().toLocaleLowerCase("en-US"),
      password,
    });
    if (!result.error) clearPendingVerificationEmail();
    return result;
  },

  async resendVerification(email: string) {
    return requireSupabase().auth.resend({
      type: "signup",
      email: email.trim().toLocaleLowerCase("en-US"),
      options: { emailRedirectTo: redirectUrl() },
    });
  },

  async sendPasswordReset(email: string) {
    return requireSupabase().auth.resetPasswordForEmail(
      email.trim().toLocaleLowerCase("en-US"),
      { redirectTo: redirectUrl("recovery") },
    );
  },

  async updatePassword(password: string) {
    return requireSupabase().auth.updateUser({ password });
  },

  async signOut(userId: string) {
    try {
      const result = await signOutAfterDeviceCleanup(
        () => removeCurrentDeviceRegistration(userId),
        () => requireSupabase().auth.signOut({ scope: "local" }),
      );
      if (result.error) {
        await activateCurrentDeviceRegistration(userId).catch(() => undefined);
      }
      return result;
    } catch (error) {
      await activateCurrentDeviceRegistration(userId).catch(() => undefined);
      throw error;
    }
  },

  async consumeCallback(url: string): Promise<AuthCallbackKind> {
    const client = requireSupabase();
    const kind = await consumeAuthCallback(url, {
      exchangeCodeForSession: (code) => client.auth.exchangeCodeForSession(code),
      verifyOtp: (parameters) => client.auth.verifyOtp(parameters),
    });
    if (kind === "verification") clearPendingVerificationEmail();
    return kind;
  },

  async signInWithGoogle(): Promise<void> {
    const client = requireSupabase();
    const callbackUrl = redirectUrl();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error("Google sign-in could not be started.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, callbackUrl);
    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Google sign-in was canceled.");
    }
    if (result.type !== "success" || !result.url) {
      throw new Error("Google sign-in did not return to Aiyomi.");
    }

    await authService.consumeCallback(result.url);
    clearPendingVerificationEmail();
  },
};
