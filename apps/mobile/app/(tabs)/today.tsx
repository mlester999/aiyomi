import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { trackMobileEvent } from "../../src/analytics/mobile";
import { CompanionIllustration } from "../../src/companions";
import { useUserCompanion } from "../../src/companions/useUserCompanion";
import { EmptyState, OfflineBanner, Screen, SecondaryButton } from "../../src/components";
import { useApp } from "../../src/providers/AppProvider";
import { colors, radii, spacing, typography } from "../../src/theme";

const greetingForNow = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function TodayScreen() {
  const router = useRouter();
  const { profile, isOffline, reloadProfile } = useApp();
  const { companion } = useUserCompanion();
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  useEffect(() => {
    trackMobileEvent(ANALYTICS_EVENTS.TODAY_FIRST_VIEWED);
  }, []);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <OfflineBanner
        onRetry={() => void reloadProfile()}
        visible={isOffline}
      />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.date}>{date}</Text>
          <Text accessibilityRole="header" style={styles.greeting}>
            {greetingForNow()}, {profile?.first_name ?? "there"}
          </Text>
          <Text style={styles.subtitle}>
            {companion?.customName ?? "Your companion"} is here when you’re ready.
          </Text>
        </View>
        <CompanionIllustration
          accessibilityLabel={`${companion?.customName ?? "Your companion"} greeting you`}
          mood="happy"
          showAura
          size="medium"
          variant={companion?.key ?? "mori"}
        />
      </View>
      <View style={styles.todayLabelRow}>
        <Text style={styles.todayLabel}>YOUR DAY</Text>
        <View style={styles.calmPill}>
          <Text style={styles.calmPillText}>Ready to shape</Text>
        </View>
      </View>
      <EmptyState
        description="You can tell Aiyomi everything on your mind, add something yourself, or start with one small thing."
        illustration={
          <CompanionIllustration
            decorative
            mood="thoughtful"
            size="large"
            variant={companion?.key ?? "mori"}
          />
        }
        primaryAction={{
          label: "Tell Aiyomi",
          onPress: () => router.push({ pathname: "/placeholder", params: { kind: "tell" } }),
        }}
        secondaryAction={{
          label: "Brain Dump",
          onPress: () => router.push({ pathname: "/placeholder", params: { kind: "brain-dump" } }),
        }}
        title="Let’s build your first day together."
      />
      <SecondaryButton
        label="Add something manually"
        onPress={() => router.push({ pathname: "/placeholder", params: { kind: "manual" } })}
        style={styles.manualAction}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  header: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    flexDirection: "row",
    minHeight: 180,
    overflow: "hidden",
    padding: spacing.lg,
  },
  headerCopy: { flex: 1, minWidth: 0, paddingRight: spacing.sm },
  date: { ...typography.caption, color: colors.primary, textTransform: "uppercase" },
  greeting: { ...typography.screenTitle, fontSize: 27, marginTop: spacing.xs },
  subtitle: { ...typography.bodySmall, marginTop: spacing.xs },
  todayLabelRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  todayLabel: { ...typography.caption, color: colors.text, letterSpacing: 1.1 },
  calmPill: { backgroundColor: "#EEE9FA", borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  calmPillText: { ...typography.caption, color: "#6F5FA0" },
  manualAction: { alignSelf: "center", maxWidth: 560 },
});
