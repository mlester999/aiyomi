import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { CompanionIllustration } from "../../src/companions";
import { useUserCompanion } from "../../src/companions/useUserCompanion";
import { PrimaryButton, Screen } from "../../src/components";
import { colors, radii, shadows, spacing, typography } from "../../src/theme";

export default function CompanionScreen() {
  const router = useRouter();
  const { companion, loading } = useUserCompanion();

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.heading}>Your companion</Text>
      <Text style={styles.intro}>A calm home for the companion growing alongside your real life.</Text>
      <View style={styles.stage}>
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Loading your companion"
            accessibilityRole="progressbar"
            color={colors.primary}
            size="large"
          />
        ) : (
          <CompanionIllustration
            accessibilityLabel={`${companion?.customName ?? "Your companion"}, ${companion?.personality ?? "balanced"} support style`}
            mood="happy"
            showAura
            size="hero"
            variant={companion?.key ?? "mori"}
          />
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{companion?.customName ?? "Your companion"}</Text>
        <Text style={styles.personality}>
          {companion?.personality
            ? `${companion.personality[0]?.toUpperCase()}${companion.personality.slice(1)} support`
            : "Balanced support"}
        </Text>
        <Text style={styles.note}>
          Conversation and deeper AI support arrive in a later phase. No fake chats are shown here.
        </Text>
      </View>
      <PrimaryButton label="Edit companion" onPress={() => router.push("/settings/companion")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center" },
  heading: { ...typography.screenTitle, textAlign: "center" },
  intro: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, maxWidth: 520, textAlign: "center" },
  stage: {
    alignItems: "center",
    backgroundColor: "#EEE9FA",
    borderRadius: radii.story,
    justifyContent: "center",
    marginTop: spacing.xl,
    minHeight: 330,
    overflow: "hidden",
    width: "100%",
    ...shadows.card,
  },
  details: { alignItems: "center", marginVertical: spacing.xl },
  name: { ...typography.screenTitle },
  personality: { ...typography.label, color: colors.primary, marginTop: spacing.xs },
  note: { ...typography.bodySmall, marginTop: spacing.md, maxWidth: 500, textAlign: "center" },
});
