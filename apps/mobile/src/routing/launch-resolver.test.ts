import { describe, expect, it } from "vitest";

import {
  redirectForSessionBoundary,
  resolveLaunchState,
  routeForLaunchState,
} from "./launch-resolver";

describe("launch resolver", () => {
  it("keeps the bootstrap boundary until local and auth state resolve", () => {
    expect(
      resolveLaunchState({
        bootstrapComplete: false,
        hasSeenIntro: false,
        hasSession: false,
        profile: null,
      }),
    ).toBe("BOOTSTRAPPING");
  });

  it("routes a first signed-out launch to the introduction", () => {
    const state = resolveLaunchState({
      bootstrapComplete: true,
      hasSeenIntro: false,
      hasSession: false,
      profile: null,
    });
    expect(routeForLaunchState(state)).toBe("/intro/meet");
  });

  it("routes a returning signed-out launch to authentication", () => {
    const state = resolveLaunchState({
      bootstrapComplete: true,
      hasSeenIntro: true,
      hasSession: false,
      profile: null,
    });
    expect(routeForLaunchState(state)).toBe("/auth/welcome");
  });

  it("resumes incomplete onboarding", () => {
    const state = resolveLaunchState({
      bootstrapComplete: true,
      hasSeenIntro: true,
      hasSession: true,
      profile: { onboarding_status: "in_progress" },
    });
    expect(routeForLaunchState(state)).toBe("/onboarding");
  });

  it("routes a completed profile to Today", () => {
    const state = resolveLaunchState({
      bootstrapComplete: true,
      hasSeenIntro: true,
      hasSession: true,
      profile: { onboarding_status: "completed" },
    });
    expect(routeForLaunchState(state)).toBe("/today");
  });
});

describe("session boundary", () => {
  it("keeps signed-out users outside private routes", () => {
    expect(
      redirectForSessionBoundary({
        hasSession: false,
        root: "settings",
      }),
    ).toBe("/");
  });

  it("keeps incomplete profiles out of completed app routes", () => {
    expect(
      redirectForSessionBoundary({
        hasSession: true,
        onboardingStatus: "in_progress",
        root: "(tabs)",
      }),
    ).toBe("/");
  });

  it("keeps completed profiles out of the editable onboarding form", () => {
    expect(
      redirectForSessionBoundary({
        hasSession: true,
        leaf: "index",
        onboardingStatus: "completed",
        root: "onboarding",
      }),
    ).toBe("/today");
  });

  it("rejects a completed profile deep-linking into the welcome handoff", () => {
    expect(
      redirectForSessionBoundary({
        hasSession: true,
        leaf: "welcome",
        onboardingStatus: "completed",
        root: "onboarding",
      }),
    ).toBe("/today");
  });

  it("allows the active session's immediate completion handoff", () => {
    expect(
      redirectForSessionBoundary({
        allowCompletionHandoff: true,
        hasSession: true,
        leaf: "welcome",
        onboardingStatus: "completed",
        root: "onboarding",
      }),
    ).toBeNull();
  });
});
