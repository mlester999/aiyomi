import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { CompanionIllustration } from "../../src/companions";
import { useUserCompanion } from "../../src/companions/useUserCompanion";
import { EmptyState, Screen } from "../../src/components";
import { colors, spacing, typography } from "../../src/theme";

export default function ProgressScreen() {
  const router = useRouter();
  const { companion } = useUserCompanion();
  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.heading}>Progress</Text>
      <Text style={styles.intro}>A truthful view of what you have actually done will live here.</Text>
      <EmptyState
        description="There are no scores, streaks, achievements, or analytics to show yet. Your real progress begins after your first day."
        illustration={
          <CompanionIllustration decorative mood="calm" size="large" variant={companion?.key ?? "mori"} />
        }
        primaryAction={{ label: "Go to Today", onPress: () => router.replace("/today") }}
        title="Your progress starts with your first day."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center" },
  heading: { ...typography.screenTitle, textAlign: "center" },
  intro: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl, marginTop: spacing.xs, textAlign: "center" },
});
