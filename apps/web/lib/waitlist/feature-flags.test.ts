import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("server-only", () => ({}));

vi.mock("../supabase/server", () => ({
  createServerSupabaseClient: () => ({ rpc }),
}));

import {
  isWaitlistEnabled,
  WaitlistFlagUnavailableError,
} from "./feature-flags";

describe("waitlist feature flag", () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it.each([true, false])("returns the hosted boolean value %s", async (enabled) => {
    rpc.mockResolvedValue({ data: enabled, error: null });

    await expect(isWaitlistEnabled()).resolves.toBe(enabled);
    expect(rpc).toHaveBeenCalledWith("is_waitlist_enabled");
  });

  it("fails closed when the RPC fails", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("unavailable") });

    await expect(isWaitlistEnabled()).rejects.toBeInstanceOf(
      WaitlistFlagUnavailableError,
    );
  });

  it("rejects a non-boolean database response", async () => {
    rpc.mockResolvedValue({ data: "true", error: null });

    await expect(isWaitlistEnabled()).rejects.toBeInstanceOf(
      WaitlistFlagUnavailableError,
    );
  });
});
