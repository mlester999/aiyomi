import { describe, expect, it, vi } from "vitest";

import { consumeAuthCallback } from "./consume-callback";

describe("auth callback consumption", () => {
  it("exchanges only the PKCE authorization code", async () => {
    const exchangeCodeForSession = vi.fn(async () => ({ error: null }));
    const verifyOtp = vi.fn(async () => ({ error: null }));

    await expect(
      consumeAuthCallback(
        "aiyomi://auth/callback?code=trusted-authorization-code",
        { exchangeCodeForSession, verifyOtp },
      ),
    ).resolves.toBe("oauth");

    expect(exchangeCodeForSession).toHaveBeenCalledOnce();
    expect(exchangeCodeForSession).toHaveBeenCalledWith(
      "trusted-authorization-code",
    );
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("verifies an allowlisted email token hash", async () => {
    const exchangeCodeForSession = vi.fn(async () => ({ error: null }));
    const verifyOtp = vi.fn(async () => ({ error: null }));

    await expect(
      consumeAuthCallback(
        "aiyomi://auth/callback?token_hash=trusted-hash&type=signup",
        { exchangeCodeForSession, verifyOtp },
      ),
    ).resolves.toBe("verification");

    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "trusted-hash",
      type: "signup",
    });
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("propagates a safe service error to the caller", async () => {
    const exchangeError = new Error("exchange failed");

    await expect(
      consumeAuthCallback("aiyomi://auth/callback?code=expired-code", {
        exchangeCodeForSession: async () => ({ error: exchangeError }),
        verifyOtp: async () => ({ error: null }),
      }),
    ).rejects.toBe(exchangeError);
  });
});
