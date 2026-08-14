// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/waitlist" }));
vi.mock("@/components/brand-lockup", () => ({
  BrandLockup: () => <a href="/">Aiyomi Admin</a>,
}));
vi.mock("@/lib/auth/actions", () => ({ logoutAction: vi.fn() }));

import { AdminShell } from "@/components/admin-shell";

const supportMember = {
  id: "00000000-0000-4000-8000-000000000001",
  userId: "00000000-0000-4000-8000-000000000002",
  email: "support@example.com",
  displayName: "Support",
  role: "support" as const,
  status: "active" as const,
  permissions: ["waitlist.read", "waitlist.status.write"] as const,
};

describe("mobile admin navigation", () => {
  afterEach(cleanup);

  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it("uses the same 860 pixel breakpoint as the mobile CSS", () => {
    render(
      <AdminShell environment="development" member={{
        ...supportMember,
        permissions: [...supportMember.permissions],
      }}>
        <p>Waitlist workspace</p>
      </AdminShell>,
    );

    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 860px)");
  });

  it("keeps the closed drawer inert and restores focus after Escape", async () => {
    render(
      <AdminShell environment="development" member={{
        ...supportMember,
        permissions: [...supportMember.permissions],
      }}>
        <p>Waitlist workspace</p>
      </AdminShell>,
    );

    const menuButton = screen.getByRole("button", { name: "Open navigation" });
    const sidebar = document.querySelector("#admin-sidebar");

    await waitFor(() => expect(sidebar?.hasAttribute("inert")).toBe(true));
    fireEvent.click(menuButton);

    const waitlistLink = await screen.findByRole("link", { name: "Waitlist" });
    await waitFor(() => expect(document.activeElement).toBe(waitlistLink));
    expect(sidebar?.hasAttribute("inert")).toBe(false);

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(document.activeElement).toBe(menuButton));
    expect(sidebar?.hasAttribute("inert")).toBe(true);
  });
});
