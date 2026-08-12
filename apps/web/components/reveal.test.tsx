// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Reveal } from "./reveal";

describe("Reveal", () => {
  it("keeps content visible in server-rendered markup", () => {
    const markup = renderToStaticMarkup(
      <Reveal className="story-example" delay={0.12}>
        <h2>Aiyomi learns what works for you.</h2>
      </Reveal>,
    );
    const host = document.createElement("div");
    host.innerHTML = markup;
    const reveal = host.firstElementChild as HTMLElement | null;

    expect(reveal).not.toBeNull();
    expect(reveal?.classList.contains("reveal")).toBe(true);
    expect(reveal?.classList.contains("story-example")).toBe(true);
    expect(reveal?.textContent).toContain("Aiyomi learns what works for you.");
    expect(reveal?.style.getPropertyValue("--reveal-start")).toBe("14%");
    expect(reveal?.style.getPropertyValue("--reveal-end")).toBe("42%");
    expect(reveal?.style.opacity).toBe("");
    expect(reveal?.style.transform).toBe("");
    expect(reveal?.hasAttribute("hidden")).toBe(false);
    expect(reveal?.getAttribute("aria-hidden")).toBeNull();
  });
});
