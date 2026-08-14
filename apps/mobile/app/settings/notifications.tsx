import type {
  NotificationPermissionStatus,
  NotificationPreferenceKey,
  NotificationPreferenceValues,
} from "@aiyomi/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  AppHeader,
  KeyboardScreen,
  LoadingButton,
  NotificationPreferenceRow,
  SecondaryButton,
} from "../../src/components";
import { appConfig } from "../../src/config/app";
import { TimeControl } from "../../src/features/onboarding/TimeControl";
import { createDefaultNotificationPreferences } from "../../src/notifications/model";
import {
  getNotificationPermissionStatus,
  loadNotificationSettings,
  refreshDeviceRegistration,
  requestHelpfulNotifications,
  scheduleDevelopmentTestNotification,
} from "../../src/notifications/service";
import { onboardingService } from "../../src/onboarding/service";
import { useApp } from "../../src/providers/AppProvider";
import { colors, radii, spacing, typography } from "../../src/theme";

const labels: readonly {
  key: NotificationPreferenceKey;
  title: string;
  description: string;
}[] = [
  { key: "morning_plan", title: "Morning plan", description: "Ready to shape your day?" },
  { key: "upcoming_activity", title: "Upcoming activity", description: "A reminder for something you planned." },
  { key: "schedule_adjustments", title: "Schedule adjustments", description: "Helpful options when plans change." },
  { key: "focus_reminder", title: "Focus reminder", description: "A future chosen focus session starts soon." },
  { key: "break_finished", title: "Break finished", description: "A gentle future focus-break reminder." },
  { key: "daily_reflection", title: "Daily reflection", description: "Want to close out your day with Aiyomi?" },
  { key: "weekly_recap", title: "Weekly recap", description: "A private summary when real data exists." },
  { key: "streak_reminder", title: "Streak reminder", description: "Off by default and never guilt-based." },
  { key: "achievements", title: "Achievements", description: "Celebrate meaningful future milestones." },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { session, profile } = useApp();
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState<"permission" | "save" | "test" | null>(null);
  const [permission, setPermission] = useState<NotificationPermissionStatus>("undetermined");
  const [preferences, setPreferences] = useState<NotificationPreferenceValues>(
    createDefaultNotificationPreferences,
  );
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timezone = profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setLoadError("Sign in again to load your notification settings.");
      return;
    }
    let active = true;
    setLoading(true);
    setLoadError(null);
    void Promise.all([
      loadNotificationSettings(userId),
      getNotificationPermissionStatus(),
    ])
      .then(([settings, status]) => {
        if (!active) return;
        setPreferences(settings.preferences);
        setQuietEnabled(settings.quietHoursEnabled);
        setQuietStart(settings.quietStart);
        setQuietEnd(settings.quietEnd);
        setPermission(status);
      })
      .catch(() => {
        if (!active) return;
        setLoadError(
          "Aiyomi couldn't load your saved notification choices. Try again before making changes.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt, userId]);

  const requestPermission = async () => {
    if (!session) return;
    setPending("permission");
    setError(null);
    setMessage(null);
    try {
      const result = await requestHelpfulNotifications(session.user.id);
      setPermission(result.status);
      setMessage(
        result.status === "granted"
          ? result.registered
            ? "Helpful reminders are ready on this device."
            : (result.reason ?? "Permission is granted. Push registration still needs owner setup.")
          : result.status === "denied"
            ? "Notifications remain off. You can continue using Aiyomi normally."
            : (result.reason ?? "Notifications are unavailable in this build."),
      );
    } catch {
      setError("Notifications couldn't be enabled yet. You can try again later.");
    } finally {
      setPending(null);
    }
  };

  const save = async () => {
    if (!session) return;
    if (quietEnabled && quietStart === quietEnd) {
      setError("Quiet hours start and end need to be different.");
      return;
    }
    setPending("save");
    setError(null);
    setMessage(null);
    let preferencesSaved = false;
    try {
      await onboardingService.saveNotificationPreferences(
        session.user.id,
        preferences,
        quietEnabled,
        quietStart,
        quietEnd,
        timezone,
      );
      preferencesSaved = true;
      const registration = await refreshDeviceRegistration(session.user.id);
      setPermission(registration.status);
      setMessage("Your notification choices are saved.");
    } catch {
      setError(
        preferencesSaved
          ? "Your choices were saved, but this device registration couldn't be refreshed. Try again when you're connected."
          : "Couldn't save those choices yet. They are still here so you can retry.",
      );
    } finally {
      setPending(null);
    }
  };

  const testNotification = async () => {
    setPending("test");
    setError(null);
    setMessage(null);
    try {
      await scheduleDevelopmentTestNotification();
      setMessage("A test notification is scheduled for about 5 seconds from now.");
    } catch {
      setError("A Development Build on a device with permission is needed for this test.");
    } finally {
      setPending(null);
    }
  };

  return (
    <KeyboardScreen maxContentWidth={620}>
      <AppHeader onBack={() => router.back()} title="Notifications" />
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : loadError ? (
        <View style={styles.loadErrorCard}>
          <Text
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            style={styles.error}
          >
            {loadError}
          </Text>
          <SecondaryButton
            label="Try again"
            onPress={() => setLoadAttempt((attempt) => attempt + 1)}
          />
        </View>
      ) : (
        <>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Device permission: {permission}</Text>
            <Text style={styles.permissionBody}>
              Permission is optional and requested only after you choose the button.
            </Text>
            <LoadingButton
              label={permission === "granted" ? "Refresh device registration" : "Turn on helpful reminders"}
              loading={pending === "permission"}
              loadingLabel="Checking permission..."
              onPress={() => void requestPermission()}
              style={styles.inlineAction}
              variant="secondary"
            />
          </View>
          <View style={styles.list}>
            {labels.map((item) => (
              <NotificationPreferenceRow
                key={item.key}
                description={item.description}
                onValueChange={(value) =>
                  setPreferences((current) => ({ ...current, [item.key]: value }))
                }
                title={item.title}
                value={preferences[item.key]}
              />
            ))}
          </View>
          <NotificationPreferenceRow
            description="Keep non-critical future nudges quiet in this window."
            onValueChange={setQuietEnabled}
            title="Quiet hours"
            value={quietEnabled}
          />
          {quietEnabled ? (
            <View style={styles.times}>
              <TimeControl label="Quiet from" onChange={setQuietStart} timezone={timezone} value={quietStart} />
              <TimeControl label="Quiet until" onChange={setQuietEnd} timezone={timezone} value={quietEnd} />
            </View>
          ) : null}
          {error ? <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
          <LoadingButton
            label="Save notification settings"
            loading={pending === "save"}
            loadingLabel="Saving settings..."
            onPress={() => void save()}
          />
          {appConfig.isDevelopment ? (
            <SecondaryButton
              label="Schedule 5-second test notification"
              loading={pending === "test"}
              loadingLabel="Scheduling test..."
              onPress={() => void testNotification()}
              style={styles.testAction}
            />
          ) : null}
        </>
      )}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  permissionCard: { backgroundColor: colors.primarySoft, borderRadius: radii.lg, marginVertical: spacing.lg, padding: spacing.lg },
  permissionTitle: { ...typography.cardTitle },
  permissionBody: { ...typography.bodySmall, marginTop: spacing.xs },
  loadErrorCard: { marginTop: spacing.xl },
  inlineAction: { marginTop: spacing.md },
  list: { gap: spacing.sm, marginBottom: spacing.md },
  times: { gap: spacing.md, marginBottom: spacing.lg, marginTop: spacing.md },
  error: { ...typography.bodySmall, color: colors.error, marginBottom: spacing.md },
  message: { ...typography.bodySmall, color: colors.success, marginBottom: spacing.md },
  testAction: { marginTop: spacing.sm },
});
