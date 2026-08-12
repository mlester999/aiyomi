// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { CompanionGallery } from "./companion-gallery";

type AnalyticsDetail = {
  name: string;
  properties?: { companion?: string };
};

describe("CompanionGallery", () => {
  afterEach(cleanup);

  it("updates the selected companion and publishes the selection analytics payload", async () => {
    const events: AnalyticsDetail[] = [];
    const receiveEvent = (event: Event) => {
      events.push((event as CustomEvent<AnalyticsDetail>).detail);
    };
    window.addEventListener("aiyomi:analytics", receiveEvent);

    try {
      const user = userEvent.setup();
      render(<CompanionGallery />);

      const mori = screen.getByRole("button", { name: /Mori/i });
      const lumi = screen.getByRole("button", { name: /Lumi/i });
      const piko = screen.getByRole("button", { name: /Piko/i });

      expect(mori.getAttribute("aria-pressed")).toBe("true");
      expect(lumi.getAttribute("aria-pressed")).toBe("false");
      expect(piko.getAttribute("aria-pressed")).toBe("false");
      expect(
        screen.getByRole("img", { name: "Mori, Meadow companion" }),
      ).toBeDefined();

      await user.click(piko);

      expect(mori.getAttribute("aria-pressed")).toBe("false");
      expect(lumi.getAttribute("aria-pressed")).toBe("false");
      expect(piko.getAttribute("aria-pressed")).toBe("true");
      expect(
        screen.getByRole("img", { name: "Piko, Sunrise companion" }),
      ).toBeDefined();
      expect(events).toEqual([
        {
          name: "companion_section_viewed",
          properties: { companion: "piko" },
        },
      ]);
    } finally {
      window.removeEventListener("aiyomi:analytics", receiveEvent);
    }
  });
});
