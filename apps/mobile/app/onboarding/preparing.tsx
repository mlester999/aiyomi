import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { CompanionIllustration } from "../../src/companions";
import { useUserCompanion } from "../../src/companions/useUserCompanion";
import { Screen, SecondaryButton } from "../../src/components";
import { useApp } from "../../src/providers/AppProvider";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function ProfilePreparingScreen() {
  const router = useRouter();
  const { reloadProfile } = useApp();
  const { companion, reload: reloadCompanion } = useUserCompanion({
    autoLoad: false,
  });
  const [preparing, setPreparing] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const prepare = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPreparing(true);
    setReady(false);
    setError(null);
    try {
      const [nextProfile, nextCompanion] = await Promise.all([
        reloadProfile(),
        reloadCompanion(),
      ]);
      if (!mountedRef.current) return;
      if (nextProfile?.onboarding_status !== "completed" || !nextCompanion) {
        setError(
          "Aiyomi couldn't confirm your finished setup yet. Your answers are saved, and you can try this check again when you're connected.",
        );
        return;
      }
      setReady(true);
    } catch {
      if (mountedRef.current) {
        setError(
          "Aiyomi couldn't finish preparing your welcome yet. Your saved setup is safe.",
        );
      }
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setPreparing(false);
    }
  }, [reloadCompanion, reloadProfile]);

  useEffect(() => {
    mountedRef.current = true;
    void prepare();
    return () => {
      mountedRef.current = false;
    };
  }, [prepare]);

  useEffect(() => {
    if (ready && companion) router.replace("/onboarding/welcome");
  }, [companion, ready, router]);

  return (
    <Screen contentContainerStyle={styles.content} maxContentWidth={520}>
      <CompanionIllustration
        accessibilityLabel={`${companion?.customName ?? "Your Aiyomi companion"} getting ready`}
        mood="celebrating"
        showAura
        size="large"
        variant={companion?.key ?? "mori"}
      />
      <Text accessibilityRole="header" style={styles.heading}>
        {error ? "Your setup needs one more check" : "Setting up your Aiyomi..."}
      </Text>
      {error ? (
        <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <SecondaryButton
            disabled={preparing}
            label="Try again"
            onPress={() => void prepare()}
          />
        </View>
      ) : (
        <View accessibilityLiveRegion="polite" style={styles.statusCard}>
          <ActivityIndicator
            accessibilityLabel="Preparing your Aiyomi setup"
            color={colors.primary}
            size="small"
          />
          <View style={styles.statusCopy}>
            <Text style={styles.status}>Getting your companion ready</Text>
            <Text style={styles.status}>Organizing your preferences</Text>
            <Text style={styles.status}>Preparing your first day</Text>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", justifyContent: "center" },
  heading: { ...typography.screenTitle, marginTop: spacing.xl, textAlign: "center" },
  statusCard: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    width: "100%",
  },
  statusCopy: { flex: 1, gap: spacing.xs },
  status: { ...typography.bodySmall },
  errorCard: {
    backgroundColor: colors.errorSoft,
    borderRadius: radii.lg,
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    width: "100%",
  },
  errorText: { ...typography.bodySmall, color: colors.error, textAlign: "center" },
});
