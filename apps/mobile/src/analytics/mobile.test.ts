import { beforeEach, describe, expect, it, vi } from "vitest";

const analyticsMocks = vi.hoisted(() => ({
  getInstallationId: vi.fn<() => Promise<string>>(),
  randomUUID: vi.fn<() => string>(),
}));

vi.mock("../storage/local", () => ({
  getInstallationId: analyticsMocks.getInstallationId,
}));

vi.mock("expo-crypto", () => ({
  randomUUID: analyticsMocks.randomUUID,
}));

describe("mobile analytics adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    analyticsMocks.getInstallationId.mockReset();
    analyticsMocks.randomUUID.mockReset();
  });

  it("does no metadata work and buffers nothing without a sink", async () => {
    const analytics = await import("./mobile");
    const sink = vi.fn();

    analytics.trackMobileEvent("intro_started", { source: "first_launch" });
    analytics.setMobileAnalyticsSink(sink);
    await Promise.resolve();

    expect(analyticsMocks.getInstallationId).not.toHaveBeenCalled();
    expect(analyticsMocks.randomUUID).not.toHaveBeenCalled();
    expect(sink).not.toHaveBeenCalled();
  });

  it("uses stable anonymous installation and session metadata per runtime", async () => {
    analyticsMocks.getInstallationId.mockResolvedValue("installation-1");
    analyticsMocks.randomUUID.mockReturnValue("session-1");
    const analytics = await import("./mobile");
    const events: unknown[] = [];
    analytics.setMobileAnalyticsSink((event) => events.push(event));

    analytics.trackMobileEvent("intro_started", { source: "first_launch" });
    analytics.trackMobileEvent("intro_completed", {
      outcome: "skipped",
      intentProvided: false,
    });

    await vi.waitFor(() => expect(events).toHaveLength(2));
    expect(analyticsMocks.getInstallationId).toHaveBeenCalledTimes(1);
    expect(analyticsMocks.randomUUID).toHaveBeenCalledTimes(1);
    expect(events).toEqual([
      {
        name: "intro_started",
        properties: { source: "first_launch" },
        context: {
          anonymousInstallationId: "installation-1",
          anonymousSessionId: "session-1",
        },
      },
      {
        name: "intro_completed",
        properties: { outcome: "skipped", intentProvided: false },
        context: {
          anonymousInstallationId: "installation-1",
          anonymousSessionId: "session-1",
        },
      },
    ]);
    expect(Object.keys((events[0] as { context: object }).context).sort()).toEqual(
      ["anonymousInstallationId", "anonymousSessionId"],
    );
  });

  it("returns immediately and drops in-flight work when the sink unregisters", async () => {
    let resolveInstallationId: ((value: string) => void) | undefined;
    analyticsMocks.getInstallationId.mockReturnValue(
      new Promise((resolve) => {
        resolveInstallationId = resolve;
      }),
    );
    analyticsMocks.randomUUID.mockReturnValue("session-1");
    const analytics = await import("./mobile");
    const sink = vi.fn();
    analytics.setMobileAnalyticsSink(sink);

    expect(analytics.trackMobileEvent("today_first_viewed")).toBeUndefined();
    expect(sink).not.toHaveBeenCalled();
    analytics.setMobileAnalyticsSink(null);
    resolveInstallationId?.("installation-1");
    await Promise.resolve();
    await Promise.resolve();

    expect(sink).not.toHaveBeenCalled();
  });
});
