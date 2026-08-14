export type AuthCallbackKind = "oauth" | "verification" | "recovery";

export interface ParsedAuthCallback {
  kind: AuthCallbackKind;
  code?: string;
  tokenHash?: string;
  otpType?: "signup" | "recovery" | "invite" | "magiclink" | "email_change" | "email";
}

const TRUSTED_SCHEME = "aiyomi:";
const ALLOWED_OTP_TYPES = new Set<ParsedAuthCallback["otpType"]>([
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
  "email",
]);

export const parseAuthCallback = (url: string): ParsedAuthCallback | null => {
  try {
    const parsed = new URL(url);
    const isAuthPath =
      (parsed.protocol === TRUSTED_SCHEME &&
        parsed.hostname === "auth" &&
        parsed.pathname === "/callback") ||
      (parsed.protocol === TRUSTED_SCHEME &&
        !parsed.hostname &&
        parsed.pathname === "/auth/callback");

    if (!isAuthPath) return null;

    const code = parsed.searchParams.get("code") ?? undefined;
    const tokenHash = parsed.searchParams.get("token_hash") ?? undefined;
    const rawType = parsed.searchParams.get("type") ?? undefined;
    const flow = parsed.searchParams.get("flow");
    const otpType = ALLOWED_OTP_TYPES.has(
      rawType as ParsedAuthCallback["otpType"],
    )
      ? (rawType as ParsedAuthCallback["otpType"])
      : undefined;

    if (!code && !(tokenHash && otpType)) return null;

    const kind: AuthCallbackKind =
      flow === "recovery" || otpType === "recovery"
        ? "recovery"
        : otpType
          ? "verification"
          : "oauth";

    return { kind, code, tokenHash, otpType };
  } catch {
    return null;
  }
};
