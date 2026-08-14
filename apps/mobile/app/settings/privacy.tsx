import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader, Screen } from "../../src/components";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  return (
    <Screen scroll maxContentWidth={560}>
      <AppHeader onBack={() => router.back()} title="Privacy & Data" />
      <Text style={styles.intro}>Your private life stays private by default.</Text>
      <View style={styles.card}>
        <Text style={styles.title}>What Aiyomi stores today</Text>
        <Text style={styles.body}>
          Your profile, companion setup, selected Life Areas, usual schedule, fixed commitments, improvement intention, self-reported obstacles, and notification choices.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>What Aiyomi does not store yet</Text>
        <Text style={styles.body}>
          There is no companion memory, AI chat history, task history, Life Model, Day Score, social profile, or fake progress in Phase 3.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Future controls</Text>
        <Text style={styles.body}>
          Secure data export, correction, memory controls, and account deletion need trusted server workflows. This route is their foundation, not an insecure client-only substitute.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.md },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, marginBottom: spacing.md, padding: spacing.lg },
  title: { ...typography.cardTitle },
  body: { ...typography.bodySmall, marginTop: spacing.xs },
});
