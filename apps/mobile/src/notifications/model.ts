import {
  NOTIFICATION_PREFERENCE_KEYS,
  type NotificationPermissionStatus,
  type NotificationPreferenceValues,
} from "@aiyomi/types";

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  morning_plan: true,
  upcoming_activity: true,
  schedule_adjustments: true,
  focus_reminder: true,
  break_finished: true,
  daily_reflection: true,
  weekly_recap: true,
  streak_reminder: false,
  achievements: true,
} as const satisfies NotificationPreferenceValues;

export const normalizePermissionStatus = (
  status: string | null | undefined,
  available = true,
): NotificationPermissionStatus => {
  if (!available) return "unavailable";
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
};

export const shouldRegisterPushToken = (
  status: NotificationPermissionStatus,
  isPhysicalDevice: boolean,
  hasProjectId: boolean,
) => status === "granted" && isPhysicalDevice && hasProjectId;

export const deviceInstallationState = (
  status: NotificationPermissionStatus,
  token: string | null,
): { enabled: boolean; expoPushToken: string | null } => {
  const expoPushToken = status === "granted" ? token?.trim() || null : null;
  return {
    enabled: expoPushToken !== null,
    expoPushToken,
  };
};

export const createDefaultNotificationPreferences =
  (): NotificationPreferenceValues => ({ ...DEFAULT_NOTIFICATION_PREFERENCES });

export const notificationPreferenceValuesFrom = (
  source: NotificationPreferenceValues,
): NotificationPreferenceValues =>
  Object.fromEntries(
    NOTIFICATION_PREFERENCE_KEYS.map((key) => [key, source[key]]),
  ) as NotificationPreferenceValues;
