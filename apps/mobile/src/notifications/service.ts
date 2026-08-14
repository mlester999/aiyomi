import type {
  NotificationPermissionStatus,
  NotificationPreferenceValues,
} from "@aiyomi/types";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { appConfig } from "../config/app";
import { requireSupabase } from "../lib/supabase";
import { getInstallationId } from "../storage/local";
import {
  deviceInstallationState,
  normalizePermissionStatus,
  notificationPreferenceValuesFrom,
  shouldRegisterPushToken,
} from "./model";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const projectId =
  Constants.expoConfig?.extra?.eas?.projectId ??
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();

const currentPlatform = (): "ios" | "android" | null => {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return null;
};

let activePushTokenListener: {
  userId: string;
  subscription: { remove: () => void };
} | null = null;
const retiringUserIds = new Set<string>();
let lifecycleQueue: Promise<void> = Promise.resolve();

const enqueueLifecycleOperation = <Result>(
  operation: () => Promise<Result>,
): Promise<Result> => {
  const result = lifecycleQueue.then(operation, operation);
  lifecycleQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

const stopPushTokenListener = (userId?: string) => {
  if (!activePushTokenListener) return;
  if (userId && activePushTokenListener.userId !== userId) return;
  activePushTokenListener.subscription.remove();
  activePushTokenListener = null;
};

const ensurePushTokenListener = (userId: string) => {
  if (Platform.OS === "web") return;
  if (activePushTokenListener?.userId === userId) return;

  stopPushTokenListener();
  const subscription = Notifications.addPushTokenListener(() => {
    if (activePushTokenListener?.userId !== userId) return;
    void refreshDeviceRegistration(userId).catch(() => {
      // Foreground lifecycle reconciliation will retry without logging token data.
    });
  });
  activePushTokenListener = { userId, subscription };
};

const persistInstallation = async (
  userId: string,
  permissionStatus: NotificationPermissionStatus,
  expoPushToken: string | null,
) => {
  const platform = currentPlatform();
  if (!platform) return;

  const registration = deviceInstallationState(
    permissionStatus,
    expoPushToken,
  );
  const installationId = await getInstallationId();
  const { error } = await requireSupabase().from("device_push_tokens").upsert(
    {
      user_id: userId,
      installation_id: installationId,
      platform,
      expo_push_token: registration.expoPushToken,
      enabled: registration.enabled,
      permission_status: permissionStatus,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,installation_id" },
  );
  if (error) throw error;
};

export const getNotificationPermissionStatus = async (): Promise<NotificationPermissionStatus> => {
  if (Platform.OS === "web") return "unavailable";
  try {
    const permission = await Notifications.getPermissionsAsync();
    return normalizePermissionStatus(permission.status, true);
  } catch {
    return "unavailable";
  }
};

const registerCurrentDeviceNow = async (
  userId: string,
  permissionStatus: NotificationPermissionStatus,
): Promise<{ registered: boolean; reason?: string }> => {
  if (permissionStatus !== "granted") stopPushTokenListener();

  if (
    !shouldRegisterPushToken(
      permissionStatus,
      Device.isDevice,
      Boolean(projectId),
    )
  ) {
    await persistInstallation(userId, permissionStatus, null);
    if (permissionStatus === "granted") ensurePushTokenListener(userId);
    return {
      registered: false,
      reason:
        permissionStatus !== "granted"
          ? "Notifications are not enabled on this device."
          : !Device.isDevice
            ? "Push tokens require a physical device."
            : "Connect this build to its EAS project before registering push tokens.",
    };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("helpful-reminders", {
      name: "Helpful reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      lightColor: "#2F7F73",
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await persistInstallation(userId, permissionStatus, token.data);
  ensurePushTokenListener(userId);
  return { registered: true };
};

export const registerCurrentDevice = async (
  userId: string,
  permissionStatus: NotificationPermissionStatus,
): Promise<{ registered: boolean; reason?: string }> => {
  if (retiringUserIds.has(userId)) {
    return {
      registered: false,
      reason: "This device registration is being removed for sign out.",
    };
  }
  return enqueueLifecycleOperation(() =>
    registerCurrentDeviceNow(userId, permissionStatus),
  );
};

export const requestHelpfulNotifications = async (
  userId: string,
): Promise<{ status: NotificationPermissionStatus; registered: boolean; reason?: string }> => {
  if (Platform.OS === "web") {
    return { status: "unavailable", registered: false, reason: "Use a Development Build on a device to enable notifications." };
  }

  const current = await Notifications.getPermissionsAsync();
  const result =
    current.status === Notifications.PermissionStatus.UNDETERMINED
      ? await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        })
      : current;
  const status = normalizePermissionStatus(result.status, true);
  const registration = await registerCurrentDevice(userId, status);
  return { status, ...registration };
};

export const refreshDeviceRegistration = async (userId: string) => {
  const status = await getNotificationPermissionStatus();
  const registration = await registerCurrentDevice(userId, status);
  return { status, ...registration };
};

export const activateCurrentDeviceRegistration = async (userId: string) => {
  retiringUserIds.delete(userId);
  return refreshDeviceRegistration(userId);
};

export const subscribeToPushTokenChanges = (userId: string) => {
  ensurePushTokenListener(userId);
  return { remove: () => stopPushTokenListener(userId) };
};

export const stopPushTokenChanges = (userId?: string) => {
  stopPushTokenListener(userId);
};

export const removeCurrentDeviceRegistration = async (userId: string) => {
  retiringUserIds.add(userId);
  stopPushTokenListener(userId);
  try {
    await enqueueLifecycleOperation(async () => {
      if (!currentPlatform()) return;

      const installationId = await getInstallationId();
      const { error } = await requireSupabase()
        .from("device_push_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("installation_id", installationId);
      if (error) throw error;
    });
  } catch (error) {
    retiringUserIds.delete(userId);
    throw error;
  }
};

export interface LoadedNotificationSettings {
  preferences: NotificationPreferenceValues;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

type NotificationSettingsRow = NotificationPreferenceValues & {
  quiet_hours_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
};

export const loadNotificationSettings = async (
  userId: string,
): Promise<LoadedNotificationSettings> => {
  const { data, error } = await requireSupabase()
    .from("notification_preferences")
    .select(
      "morning_plan,upcoming_activity,schedule_adjustments,focus_reminder,break_finished,daily_reflection,weekly_recap,streak_reminder,achievements,quiet_hours_enabled,quiet_start,quiet_end",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  const row = data as NotificationSettingsRow | null;
  if (!row) {
    throw new Error("Notification settings are not available for this account.");
  }

  return {
    preferences: notificationPreferenceValuesFrom(row),
    quietHoursEnabled: row.quiet_hours_enabled,
    quietStart: row.quiet_start.slice(0, 5),
    quietEnd: row.quiet_end.slice(0, 5),
  };
};

export const scheduleDevelopmentTestNotification = async () => {
  if (!appConfig.isDevelopment || Platform.OS === "web") {
    throw new Error("Test notifications are available only in Development Builds.");
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Aiyomi test reminder",
      body: "Your helpful reminders are ready.",
      data: { kind: "development_test" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });
};
