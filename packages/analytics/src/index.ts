export const ANALYTICS_EVENTS = {
  LANDING_VIEWED: "landing_viewed",
  HERO_WAITLIST_CLICKED: "hero_waitlist_clicked",
  WAITLIST_STARTED: "waitlist_started",
  PLATFORM_SELECTED: "platform_selected",
  WAITLIST_COMPLETED: "waitlist_completed",
  WAITLIST_FAILED: "waitlist_failed",
  FEATURE_SECTION_VIEWED: "feature_section_viewed",
  COMPANION_SECTION_VIEWED: "companion_section_viewed",
  FINAL_CTA_CLICKED: "final_cta_clicked",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type WaitlistSource =
  | "navigation"
  | "mobile_navigation"
  | "hero"
  | "inline"
  | "final_cta";
type Platform = "ios" | "android" | "both";
export const FEATURE_SECTIONS = [
  "today",
  "what_should_i_do",
  "brain_dump",
  "focus",
  "life_model",
  "intent_reality",
  "day_score",
  "progress",
  "gamification",
  "world",
  "community",
  "sharing",
  "principles",
] as const;

export type FeatureSection = (typeof FEATURE_SECTIONS)[number];

const featureSectionNames = new Set<string>(FEATURE_SECTIONS);

export const isFeatureSection = (value: unknown): value is FeatureSection =>
  typeof value === "string" && featureSectionNames.has(value);

export interface AnalyticsEventProperties {
  landing_viewed: undefined;
  hero_waitlist_clicked: { source?: WaitlistSource };
  waitlist_started: { source?: WaitlistSource };
  platform_selected: { platform: Platform };
  waitlist_completed: {
    source?: WaitlistSource;
    platform: Platform;
  };
  waitlist_failed: {
    source?: WaitlistSource;
    reason:
      | "validation"
      | "rate_limited"
      | "unavailable"
      | "request_failed"
      | "unknown";
  };
  feature_section_viewed: { section: FeatureSection };
  companion_section_viewed: { companion?: "mori" | "lumi" | "piko" };
  final_cta_clicked: { source?: "final_cta" };
}

export interface AnalyticsEventDetail<Name extends AnalyticsEventName> {
  name: Name;
  properties?: AnalyticsEventProperties[Name];
}

export const trackEvent = <Name extends AnalyticsEventName>(
  name: Name,
  properties?: AnalyticsEventProperties[Name],
): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AnalyticsEventDetail<Name>>("aiyomi:analytics", {
      detail: { name, properties },
    }),
  );
};
