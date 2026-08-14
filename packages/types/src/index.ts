export const WAITLIST_PLATFORM_INTERESTS = ["ios", "android", "both"] as const;

export type WaitlistPlatformInterest =
  (typeof WAITLIST_PLATFORM_INTERESTS)[number];

export const WAITLIST_SOURCES = [
  "landing_page",
  "direct",
  "referral",
  "organic",
  "social",
  "other",
] as const;

export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export const WAITLIST_STATUSES = [
  "pending",
  "confirmed",
  "invited",
  "converted",
  "unsubscribed",
] as const;

export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export interface WaitlistAttribution {
  source: WaitlistSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referralCode?: string;
}

export interface WaitlistSignupInput extends WaitlistAttribution {
  email: string;
  firstName?: string;
  platformInterest: WaitlistPlatformInterest;
  marketingConsent: boolean;
  website: string;
  formStartedAt?: number;
  locale?: string;
}

export type WaitlistApiSuccess = {
  ok: true;
  alreadyJoined: false;
};

export type WaitlistApiError = {
  ok: false;
  error: string;
};

export type WaitlistApiResponse = WaitlistApiSuccess | WaitlistApiError;

export const ADMIN_MEMBER_ROLES = [
  "super_admin",
  "admin",
  "analyst",
  "support",
] as const;

export type AdminMemberRole = (typeof ADMIN_MEMBER_ROLES)[number];

export const ADMIN_MEMBER_STATUSES = ["active", "suspended"] as const;

export type AdminMemberStatus = (typeof ADMIN_MEMBER_STATUSES)[number];

export const ADMIN_PERMISSIONS = [
  "dashboard.read",
  "waitlist.read",
  "waitlist.status.write",
  "waitlist.export",
  "analytics.read",
  "referrals.read",
  "audit.read",
  "admins.read",
  "admins.write",
  "feature_flags.read",
  "feature_flags.write",
  "settings.read",
  "settings.write",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const DEPLOYMENT_ENVIRONMENTS = [
  "development",
  "staging",
  "production",
] as const;

export type DeploymentEnvironment =
  (typeof DEPLOYMENT_ENVIRONMENTS)[number];

export const FEATURE_FLAG_KEYS = ["waitlist_enabled"] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

export const APPLICATION_SETTING_KEYS = [
  "support_url",
  "privacy_url",
  "terms_url",
] as const;

export type ApplicationSettingKey =
  (typeof APPLICATION_SETTING_KEYS)[number];

export interface AdminCurrentMember {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  role: AdminMemberRole;
  status: "active";
  permissions: AdminPermission[];
}

export const MOBILE_PLATFORMS = ["ios", "android"] as const;

export type MobilePlatform = (typeof MOBILE_PLATFORMS)[number];

export const PRE_AUTH_INTENTS = [
  "get_organized",
  "build_routines",
  "focus_better",
  "reach_a_goal",
  "balance_my_life",
  "something_else",
] as const;

export type PreAuthIntent = (typeof PRE_AUTH_INTENTS)[number];

export const ONBOARDING_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export const ONBOARDING_STEPS = [
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

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const SKIPPABLE_ONBOARDING_STEPS = [
  "fixed_commitments",
  "obstacles",
  "energy_baseline",
  "notification_setup",
] as const satisfies readonly OnboardingStep[];

export type SkippableOnboardingStep =
  (typeof SKIPPABLE_ONBOARDING_STEPS)[number];

export const COMPANION_KEYS = ["mori", "lumi", "piko"] as const;

export type CompanionKey = (typeof COMPANION_KEYS)[number];

export const COMPANION_PERSONALITIES = [
  "gentle",
  "balanced",
  "coach",
] as const;

export type CompanionPersonality =
  (typeof COMPANION_PERSONALITIES)[number];

export const COMPANION_NUDGE_LEVELS = ["low", "normal", "high"] as const;

export type CompanionNudgeLevel =
  (typeof COMPANION_NUDGE_LEVELS)[number];

export const COMPANION_PERSONALITY_NUDGE_LEVEL = {
  gentle: "low",
  balanced: "normal",
  coach: "high",
} as const satisfies Record<CompanionPersonality, CompanionNudgeLevel>;

export const LIFE_AREA_KEYS = [
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
] as const;

export type LifeAreaKey = (typeof LIFE_AREA_KEYS)[number];

export const LIFE_ROLE_KEYS = [
  "student",
  "employed",
  "self_employed",
  "business_owner",
  "parent_caregiver",
  "flexible_schedule",
  "other",
] as const;

export type LifeRoleKey = (typeof LIFE_ROLE_KEYS)[number];

export const OBSTACLE_KEYS = [
  "procrastination",
  "social_media",
  "poor_planning",
  "low_energy",
  "too_many_responsibilities",
  "distractions",
  "motivation",
  "overcommitting",
  "inconsistent_routine",
  "not_sure_where_to_start",
  "something_else",
] as const;

export type ObstacleKey = (typeof OBSTACLE_KEYS)[number];

export const ENERGY_BASELINES = [
  "morning",
  "afternoon",
  "evening",
  "varies",
  "not_sure",
] as const;

export type EnergyBaseline = (typeof ENERGY_BASELINES)[number];

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const PERSISTED_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export type PersistedWeekday = (typeof PERSISTED_WEEKDAYS)[number];

export const WEEKDAY_NAME_BY_NUMBER = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
} as const satisfies Record<PersistedWeekday, Weekday>;

export const WEEKDAY_NUMBER_BY_NAME = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
} as const satisfies Record<Weekday, PersistedWeekday>;

export const NOTIFICATION_PERMISSION_STATUSES = [
  "undetermined",
  "granted",
  "denied",
  "unavailable",
] as const;

export type NotificationPermissionStatus =
  (typeof NOTIFICATION_PERMISSION_STATUSES)[number];

export const NOTIFICATION_CATEGORIES = [
  "planning",
  "focus",
  "growth",
  "social",
] as const;

export type NotificationCategory =
  (typeof NOTIFICATION_CATEGORIES)[number];

export const ACTIVE_NOTIFICATION_CATEGORIES = [
  "planning",
  "focus",
  "growth",
] as const satisfies readonly NotificationCategory[];

export const NOTIFICATION_PREFERENCE_KEYS = [
  "morning_plan",
  "upcoming_activity",
  "schedule_adjustments",
  "focus_reminder",
  "break_finished",
  "daily_reflection",
  "weekly_recap",
  "streak_reminder",
  "achievements",
] as const;

export type NotificationPreferenceKey =
  (typeof NOTIFICATION_PREFERENCE_KEYS)[number];

export const NOTIFICATION_PREFERENCE_CATEGORIES = {
  morning_plan: "planning",
  upcoming_activity: "planning",
  schedule_adjustments: "planning",
  focus_reminder: "focus",
  break_finished: "focus",
  daily_reflection: "growth",
  weekly_recap: "growth",
  streak_reminder: "growth",
  achievements: "growth",
} as const satisfies Record<NotificationPreferenceKey, NotificationCategory>;

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  timezone: string | null;
  locale: string | null;
  onboardingStatus: OnboardingStatus;
  onboardingStep: OnboardingStep | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionDefinition {
  id: string;
  key: CompanionKey;
  name: string;
  description: string;
  assetKey: string;
  active: boolean;
  sortOrder: number;
}

export interface UserCompanion {
  id: string;
  userId: string;
  companionId: string;
  companionKey: CompanionKey;
  name: string;
  personality: CompanionPersonality;
  nudgeLevel: CompanionNudgeLevel;
  createdAt: string;
  updatedAt: string;
}

interface UserLifeAreaBase {
  id: string;
  userId: string;
  createdAt: string;
}

export type UserLifeArea = UserLifeAreaBase &
  (
    | {
        kind: "definition";
        definitionKey: LifeAreaKey;
        customName: null;
      }
    | {
        kind: "custom";
        definitionKey: null;
        customName: string;
      }
  );

export interface FixedCommitment {
  id: string;
  userId: string;
  title: string;
  daysOfWeek: PersistedWeekday[];
  startTime: string;
  endTime: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserOnboardingContext {
  userId: string;
  wakeTime: string;
  sleepTime: string;
  timezone: string;
  lifeRoles: LifeRoleKey[];
  improvementFocus: string;
  obstacles: ObstacleKey[];
  customObstacle: string | null;
  energyBaseline: EnergyBaseline | null;
  updatedAt: string;
}

export type NotificationPreferenceValues = Record<
  NotificationPreferenceKey,
  boolean
>;

export interface NotificationSettings {
  userId: string;
  permissionStatus: NotificationPermissionStatus;
  deviceEnabled: boolean;
  preferences: NotificationPreferenceValues;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  nudgeLevel: CompanionNudgeLevel;
  updatedAt: string;
}

export interface DevicePushToken {
  id: string;
  userId: string;
  installationId: string;
  platform: MobilePlatform;
  expoPushToken: string | null;
  enabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}
