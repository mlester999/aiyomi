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
