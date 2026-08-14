import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { CompanionIllustration } from "../src/companions";
import { AppHeader, Screen, SecondaryButton } from "../src/components";
import { colors, spacing, typography } from "../src/theme";

const titles: Record<string, string> = {
  tell: "Tell Aiyomi",
  "brain-dump": "Brain Dump",
  manual: "Add manually",
};

export default function PhaseFourPlaceholderScreen() {
  const router = useRouter();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  return (
    <Screen contentContainerStyle={styles.content} maxContentWidth={520}>
      <AppHeader onBack={() => router.back()} title={titles[kind ?? ""] ?? "First day"} />
      <CompanionIllustration decorative mood="focused" size="large" variant="mori" />
      <Text accessibilityRole="header" style={styles.heading}>Your first day stays real.</Text>
      <Text style={styles.body}>
        This action is ready for the Phase 4 Daily Life Engine. Aiyomi has not created a fake task or plan for you.
      </Text>
      <SecondaryButton label="Back to Today" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center" },
  heading: { ...typography.screenTitle, marginTop: spacing.xl, textAlign: "center" },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl, marginTop: spacing.sm, textAlign: "center" },
});
