import { describe, expect, it } from "vitest";

import { parseAuthCallback } from "./callback";

describe("auth callback parser", () => {
  it("accepts the Aiyomi PKCE callback", () => {
    expect(parseAuthCallback("aiyomi://auth/callback?code=trusted-code")).toMatchObject({
      kind: "oauth",
      code: "trusted-code",
    });
  });

  it("recognizes password recovery", () => {
    expect(
      parseAuthCallback(
        "aiyomi://auth/callback?token_hash=hash&type=recovery&flow=recovery",
      ),
    ).toMatchObject({ kind: "recovery", tokenHash: "hash", otpType: "recovery" });
  });

  it("rejects an untrusted scheme or path", () => {
    expect(parseAuthCallback("https://attacker.example/auth/callback?code=nope")).toBeNull();
    expect(parseAuthCallback("aiyomi://profile?code=nope")).toBeNull();
  });

  it("rejects malformed callbacks without a trusted token", () => {
    expect(parseAuthCallback("aiyomi://auth/callback?type=signup")).toBeNull();
    expect(parseAuthCallback("not a url")).toBeNull();
  });
});
