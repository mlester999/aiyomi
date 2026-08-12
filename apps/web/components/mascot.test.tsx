// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Mascot } from "./mascot";

describe("Mascot", () => {
  afterEach(cleanup);

  it("maps variants, poses, and accessories to stable styling classes", () => {
    const { container } = render(
      <>
        <Mascot
          variant="mori"
          pose="wave"
          accessory="book"
          className="mori-example"
          label="Mori waving with a book"
        />
        <Mascot
          variant="lumi"
          pose="focus"
          accessory="headphones"
          className="lumi-example"
          label="Lumi focusing with headphones"
        />
        <Mascot
          variant="piko"
          pose="celebrate"
          accessory="lantern"
          className="piko-example"
          decorative
        />
      </>,
    );

    const examples = [
      [".mori-example", "mascot-mori", "mascot-pose-wave", "mascot-accessory-book"],
      [
        ".lumi-example",
        "mascot-lumi",
        "mascot-pose-focus",
        "mascot-accessory-headphones",
      ],
      [
        ".piko-example",
        "mascot-piko",
        "mascot-pose-celebrate",
        "mascot-accessory-lantern",
      ],
    ] as const;

    for (const [selector, ...classNames] of examples) {
      const mascot = container.querySelector(selector);
      expect(mascot).not.toBeNull();
      for (const className of classNames) {
        expect(mascot?.classList.contains(className)).toBe(true);
      }
    }
  });

  it("exposes meaningful mascots and hides decorative mascots from assistive technology", () => {
    const { container, getByRole } = render(
      <>
        <Mascot variant="lumi" pose="reflect" />
        <Mascot variant="piko" className="decorative-example" decorative />
      </>,
    );

    const meaningfulMascot = getByRole("img", {
      name: "Lumi, a lavender star companion",
    });
    expect(meaningfulMascot.getAttribute("aria-hidden")).toBeNull();

    const decorativeMascot = container.querySelector(".decorative-example");
    expect(decorativeMascot?.getAttribute("aria-hidden")).toBe("true");
    expect(decorativeMascot?.getAttribute("aria-label")).toBeNull();
    expect(decorativeMascot?.getAttribute("role")).toBeNull();
  });
});
