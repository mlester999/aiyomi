import { describe, expect, it, vi } from "vitest";

import { signOutAfterDeviceCleanup } from "./sign-out";

describe("notification-safe sign out", () => {
  it("removes the device registration before local auth sign out", async () => {
    const order: string[] = [];

    await signOutAfterDeviceCleanup(
      async () => {
        order.push("device");
      },
      async () => {
        order.push("auth");
        return "signed-out";
      },
    );

    expect(order).toEqual(["device", "auth"]);
  });

  it("keeps the authenticated session when device cleanup fails", async () => {
    const localSignOut = vi.fn(async () => "signed-out");

    await expect(
      signOutAfterDeviceCleanup(async () => {
        throw new Error("offline");
      }, localSignOut),
    ).rejects.toThrow("offline");
    expect(localSignOut).not.toHaveBeenCalled();
  });
});
