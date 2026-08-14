import type { OnboardingStep } from "@aiyomi/types";

export const ONBOARDING_PAGES = [
  "preferred_name",
  "companion_selection",
  "companion_name",
  "life_areas",
  "normal_day",
  "fixed_commitments",
  "improvement_focus",
  "notification_setup",
] as const satisfies readonly OnboardingStep[];

export type OnboardingPage = (typeof ONBOARDING_PAGES)[number];

const persistedStepToPage: Record<OnboardingStep, OnboardingPage> = {
  preferred_name: "preferred_name",
  companion_selection: "companion_selection",
  companion_name: "companion_name",
  companion_personality: "companion_name",
  life_areas: "life_areas",
  normal_day: "normal_day",
  life_roles: "normal_day",
  fixed_commitments: "fixed_commitments",
  improvement_focus: "improvement_focus",
  obstacles: "improvement_focus",
  energy_baseline: "improvement_focus",
  notification_setup: "notification_setup",
};

export const pageForPersistedStep = (
  step: OnboardingStep | null | undefined,
): OnboardingPage => (step ? persistedStepToPage[step] : "preferred_name");

export const onboardingPageNumber = (page: OnboardingPage) =>
  ONBOARDING_PAGES.indexOf(page) + 1;

export const nextOnboardingPage = (
  page: OnboardingPage,
): OnboardingPage | null => {
  const index = ONBOARDING_PAGES.indexOf(page);
  return ONBOARDING_PAGES[index + 1] ?? null;
};

export const previousOnboardingPage = (
  page: OnboardingPage,
): OnboardingPage | null => {
  const index = ONBOARDING_PAGES.indexOf(page);
  return index > 0 ? ONBOARDING_PAGES[index - 1] : null;
};

export const isOnboardingPage = (value: string): value is OnboardingPage =>
  (ONBOARDING_PAGES as readonly string[]).includes(value);
