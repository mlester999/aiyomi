export const LIFE_AREAS = [
  "work",
  "learning",
  "school",
  "business",
  "health",
  "fitness",
  "family",
  "relationships",
  "finance",
  "creative",
  "personal",
  "household",
  "wellbeing",
  "custom",
] as const;

export type LifeArea = (typeof LIFE_AREAS)[number];

export const DAY_CONTEXTS = [
  "regular",
  "light",
  "rest",
  "recovery",
  "sick",
  "vacation",
] as const;

export type DayContext = (typeof DAY_CONTEXTS)[number];

export const COMMITMENT_LEVELS = ["minimum", "target", "stretch"] as const;
export type CommitmentLevel = (typeof COMMITMENT_LEVELS)[number];

export const isRestOrRecoveryDay = (context: DayContext): boolean =>
  context === "rest" ||
  context === "recovery" ||
  context === "sick" ||
  context === "vacation";
