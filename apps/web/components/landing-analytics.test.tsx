// @vitest-environment jsdom

import { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LandingAnalytics } from "./landing-analytics";

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];

  readonly root = null;
  readonly rootMargin = "0px 0px -20% 0px";
  readonly thresholds = [0.25];
  readonly observed = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    IntersectionObserverMock.instances.push(this);
  }

  observe(target: Element) {
    this.observed.add(target);
  }

  unobserve(target: Element) {
    this.observed.delete(target);
  }

  disconnect() {
    this.observed.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  intersect(target: Element) {
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

describe("LandingAnalytics", () => {
  beforeEach(() => {
    IntersectionObserverMock.instances = [];
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("tracks marked feature sections once and ignores unknown or unmarked content", () => {
    const events: Array<{ name: string; properties?: { section?: string } }> = [];
    const receiveEvent = (event: Event) => {
      events.push(
        (event as CustomEvent<{ name: string; properties?: { section?: string } }>).detail,
      );
    };
    window.addEventListener("aiyomi:analytics", receiveEvent);

    const { container } = render(
      <StrictMode>
        <LandingAnalytics />
        <section data-analytics-section="what_should_i_do" />
        <section data-analytics-section="life_model" />
        <section data-analytics-section="world" />
        <section data-analytics-section="unknown" />
        <section />
      </StrictMode>,
    );

    const observer = IntersectionObserverMock.instances.at(-1);
    expect(observer).toBeDefined();
    expect(observer?.observed).toHaveLength(3);

    for (const section of container.querySelectorAll<HTMLElement>(
      "[data-analytics-section]",
    )) {
      observer?.intersect(section);
      observer?.intersect(section);
    }

    expect(events.filter((event) => event.name === "landing_viewed")).toHaveLength(1);
    expect(
      events
        .filter((event) => event.name === "feature_section_viewed")
        .map((event) => event.properties?.section),
    ).toEqual(["what_should_i_do", "life_model", "world"]);

    window.removeEventListener("aiyomi:analytics", receiveEvent);
  });
});
