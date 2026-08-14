import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { CompanionIllustration } from "../../src/companions";
import { useUserCompanion } from "../../src/companions/useUserCompanion";
import { PrimaryButton, Screen, SecondaryButton } from "../../src/components";
import { useApp } from "../../src/providers/AppProvider";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function PersonalizedWelcomeScreen() {
  const router = useRouter();
  const { profile } = useApp();
  const { companion, error, loading, reload } = useUserCompanion();

  return (
    <Screen contentContainerStyle={styles.content} maxContentWidth={520} scroll>
      {companion ? (
        <CompanionIllustration
          accessibilityLabel={`${companion.customName}, your ${companion.personality} Aiyomi companion`}
          mood="celebrating"
          showAura
          size="hero"
          variant={companion.key}
        />
      ) : (
        <View style={styles.companionError}>
          {loading ? (
            <ActivityIndicator
              accessibilityLabel="Loading your companion welcome"
              color={colors.primary}
              size="large"
            />
          ) : (
            <>
              <Text
                accessibilityLiveRegion="assertive"
                accessibilityRole="alert"
                style={styles.errorText}
              >
                {error ?? "Your companion isn't ready to appear yet."}
              </Text>
              <SecondaryButton
                label="Try loading companion again"
                onPress={() => void reload()}
              />
            </>
          )}
        </View>
      )}
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.heading}>
          Hi {profile?.first_name ?? "there"} 👋
        </Text>
        <Text style={styles.introduction}>
          I’m {companion?.customName ?? "your companion"}.
        </Text>
        <Text style={styles.body}>I’m ready whenever you are.</Text>
        <Text style={styles.handoff}>Let’s build your first day together.</Text>
      </View>
      <PrimaryButton
        label="Start my first day"
        onPress={() => router.replace("/today")}
        style={styles.action}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", justifyContent: "center" },
  copy: { alignItems: "center", marginTop: spacing.xl },
  heading: { ...typography.screenTitle, textAlign: "center" },
  introduction: { ...typography.sectionTitle, marginTop: spacing.md, textAlign: "center" },
  body: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  handoff: { ...typography.body, fontWeight: "700", marginTop: spacing.lg, textAlign: "center" },
  action: { marginTop: spacing.xl },
  companionError: {
    alignItems: "center",
    backgroundColor: colors.errorSoft,
    borderRadius: radii.lg,
    gap: spacing.md,
    minHeight: 148,
    justifyContent: "center",
    padding: spacing.lg,
    width: "100%",
  },
  errorText: { ...typography.bodySmall, color: colors.error, textAlign: "center" },
});
