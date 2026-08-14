import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  requireSupabase: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  requireSupabase: mocks.requireSupabase,
}));

import { onboardingService, onlyActiveDefinitions } from "./service";

describe("onboarding persistence hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ upsert: mocks.upsert });
    mocks.requireSupabase.mockReturnValue({ from: mocks.from });
  });

  it("reuses a client commitment ID when the same save is retried", async () => {
    const commitment = {
      id: "11111111-1111-4111-8111-111111111111",
      title: "  School  ",
      daysOfWeek: [1, 3, 5],
      startTime: "09:00",
      endTime: "15:00",
    };

    await onboardingService.saveCommitments(
      "user-1",
      [commitment],
      [],
      "Asia/Manila",
      { advance: false },
    );
    await onboardingService.saveCommitments(
      "user-1",
      [commitment],
      [],
      "Asia/Manila",
      { advance: false },
    );

    expect(mocks.upsert).toHaveBeenCalledTimes(2);
    for (const [payload, options] of mocks.upsert.mock.calls) {
      expect(payload).toMatchObject({
        id: commitment.id,
        title: "School",
        user_id: "user-1",
      });
      expect(options).toEqual({ onConflict: "id" });
    }
  });

  it("keeps only active catalog definitions", () => {
    const definitions = [
      { active: true, key: "mori" },
      { active: false, key: "retired" },
      { active: true, key: "lumi" },
    ];

    expect(onlyActiveDefinitions(definitions).map((item) => item.key)).toEqual([
      "mori",
      "lumi",
    ]);
  });
});
