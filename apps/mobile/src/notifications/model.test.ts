import { describe, expect, it } from "vitest";

import {
  createDefaultNotificationPreferences,
  deviceInstallationState,
  normalizePermissionStatus,
  notificationPreferenceValuesFrom,
  shouldRegisterPushToken,
} from "./model";

describe("notification foundation", () => {
  it("keeps denied permission optional", () => {
    expect(normalizePermissionStatus("denied")).toBe("denied");
    expect(shouldRegisterPushToken("denied", true, true)).toBe(false);
  });

  it("reports unsupported environments honestly", () => {
    expect(normalizePermissionStatus("granted", false)).toBe("unavailable");
  });

  it("requires permission, a physical device, and EAS project configuration", () => {
    expect(shouldRegisterPushToken("granted", true, true)).toBe(true);
    expect(shouldRegisterPushToken("granted", false, true)).toBe(false);
    expect(shouldRegisterPushToken("granted", true, false)).toBe(false);
  });

  it("clears stale tokens whenever permission is not granted", () => {
    expect(
      deviceInstallationState("denied", "ExponentPushToken[previous]"),
    ).toEqual({ enabled: false, expoPushToken: null });
    expect(deviceInstallationState("unavailable", null)).toEqual({
      enabled: false,
      expoPushToken: null,
    });
  });

  it("enables only a granted installation with a non-empty token", () => {
    expect(
      deviceInstallationState("granted", " ExponentPushToken[current] "),
    ).toEqual({
      enabled: true,
      expoPushToken: "ExponentPushToken[current]",
    });
    expect(deviceInstallationState("granted", "  ")).toEqual({
      enabled: false,
      expoPushToken: null,
    });
  });

  it("copies every persisted preference without falling back over false values", () => {
    const persisted = {
      ...createDefaultNotificationPreferences(),
      morning_plan: false,
      achievements: false,
    };

    expect(notificationPreferenceValuesFrom(persisted)).toEqual(persisted);
  });
});
