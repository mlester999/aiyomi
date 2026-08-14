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
  APP_OPENED: "app_opened",
  INTRO_STARTED: "intro_started",
  INTRO_COMPLETED: "intro_completed",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_COMPLETED: "login_completed",
  GOOGLE_AUTH_STARTED: "google_auth_started",
  GOOGLE_AUTH_COMPLETED: "google_auth_completed",
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  COMPANION_SELECTED: "companion_selected",
  COMPANION_NAMED: "companion_named",
  COMPANION_PERSONALITY_SELECTED: "companion_personality_selected",
  LIFE_AREAS_SELECTED: "life_areas_selected",
  NOTIFICATION_EDUCATION_VIEWED: "notification_education_viewed",
  NOTIFICATION_PERMISSION_RESULT: "notification_permission_result",
  ONBOARDING_COMPLETED: "onboarding_completed",
  TODAY_FIRST_VIEWED: "today_first_viewed",
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

export const MOBILE_ANALYTICS_ONBOARDING_STEPS = [
  "preferred_name",
  "companion_selection",
  "companion_name",
  "companion_personality",
  "life_areas",
  "normal_day",
  "life_roles",
  "fixed_commitments",
  "improvement_focus",
  "obstacles",
  "energy_baseline",
  "notification_setup",
] as const;

export type MobileAnalyticsOnboardingStep =
  (typeof MOBILE_ANALYTICS_ONBOARDING_STEPS)[number];

export type MobileAuthMethod = "email" | "google";

export type MobileNotificationPermissionStatus =
  | "undetermined"
  | "granted"
  | "denied"
  | "unavailable";

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
  app_opened: {
    platform: "ios" | "android";
    launch: "cold" | "warm";
  };
  intro_started: { source: "first_launch" | "revisit" };
  intro_completed: {
    outcome: "completed" | "skipped";
    intentProvided: boolean;
  };
  signup_started: { method: MobileAuthMethod };
  signup_completed: { method: MobileAuthMethod };
  login_completed: { method: MobileAuthMethod };
  google_auth_started: undefined;
  google_auth_completed: undefined;
  onboarding_started: { state: "new" | "resumed" };
  onboarding_step_completed: {
    step: MobileAnalyticsOnboardingStep;
    outcome: "completed" | "skipped";
  };
  companion_selected: { companion: "mori" | "lumi" | "piko" };
  companion_named: { usedSuggestedName: boolean };
  companion_personality_selected: {
    personality: "gentle" | "balanced" | "coach";
  };
  life_areas_selected: {
    count: number;
    includesCustom: boolean;
  };
  notification_education_viewed: undefined;
  notification_permission_result: {
    status: MobileNotificationPermissionStatus;
    source: "onboarding" | "settings";
  };
  onboarding_completed: {
    notificationPermission: MobileNotificationPermissionStatus;
  };
  today_first_viewed: undefined;
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
