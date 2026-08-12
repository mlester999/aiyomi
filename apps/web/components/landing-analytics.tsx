"use client";

import { useEffect, useRef } from "react";
import {
  isFeatureSection,
  trackEvent,
  type FeatureSection,
} from "@aiyomi/analytics";

const analyticsSectionSelector = "[data-analytics-section]";

export function LandingAnalytics() {
  const landingTracked = useRef(false);
  const viewedSections = useRef(new Set<FeatureSection>());

  useEffect(() => {
    if (!landingTracked.current) {
      trackEvent("landing_viewed");
      landingTracked.current = true;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const section = entry.target.getAttribute("data-analytics-section");

          if (!isFeatureSection(section) || viewedSections.current.has(section)) {
            continue;
          }

          viewedSections.current.add(section);
          trackEvent("feature_section_viewed", { section });
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.25,
      },
    );

    document.querySelectorAll<HTMLElement>(analyticsSectionSelector).forEach((element) => {
      if (isFeatureSection(element.dataset.analyticsSection)) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
