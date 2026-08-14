import { parseAuthCallback, type AuthCallbackKind, type ParsedAuthCallback } from "./callback";

type OtpType = NonNullable<ParsedAuthCallback["otpType"]>;

interface CallbackAuthActions {
  exchangeCodeForSession: (code: string) => Promise<{ error: unknown | null }>;
  verifyOtp: (parameters: {
    token_hash: string;
    type: OtpType;
  }) => Promise<{ error: unknown | null }>;
}

export const consumeAuthCallback = async (
  url: string,
  auth: CallbackAuthActions,
): Promise<AuthCallbackKind> => {
  const callback = parseAuthCallback(url);
  if (!callback) throw new Error("This sign-in link is not valid for Aiyomi.");

  if (callback.code) {
    const { error } = await auth.exchangeCodeForSession(callback.code);
    if (error) throw error;
    return callback.kind;
  }

  if (callback.tokenHash && callback.otpType) {
    const { error } = await auth.verifyOtp({
      token_hash: callback.tokenHash,
      type: callback.otpType,
    });
    if (error) throw error;
    return callback.kind;
  }

  throw new Error("This sign-in link is incomplete.");
};
