import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { trackMobileEvent } from "../../src/analytics/mobile";
import { authService } from "../../src/auth/service";
import { safeAuthError } from "../../src/auth/errors";
import { LoadingButton, Screen, SecondaryButton } from "../../src/components";
import { FormError, OrDivider } from "../../src/features/auth/AuthScaffold";
import { colors, radii, shadows, spacing, typography } from "../../src/theme";
import { aiyomiMark } from "../../src/assets/brand";

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionInFlight = useRef(false);

  const continueWithGoogle = async () => {
    if (actionInFlight.current) return;
    setError(null);
    actionInFlight.current = true;
    setGooglePending(true);
    trackMobileEvent(ANALYTICS_EVENTS.GOOGLE_AUTH_STARTED);
    try {
      await authService.signInWithGoogle();
      trackMobileEvent(ANALYTICS_EVENTS.GOOGLE_AUTH_COMPLETED);
      router.replace("/");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      if (!message.toLowerCase().includes("canceled")) setError(safeAuthError(caught));
    } finally {
      actionInFlight.current = false;
      setGooglePending(false);
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.content} maxContentWidth={520}>
      <View style={styles.heroCard}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Aiyomi companion ready to meet you"
          resizeMode="contain"
          source={aiyomiMark}
          style={styles.icon}
        />
        <Text accessibilityRole="header" style={styles.heading}>
          Let’s get to know each other.
        </Text>
        <Text style={styles.body}>
          Sign in to save your companion and continue wherever you left off.
        </Text>
      </View>
      <FormError message={error} />
      <LoadingButton
        disabled={googlePending}
        label="Continue with Google"
        loading={googlePending}
        loadingLabel="Continuing with Google..."
        onPress={() => void continueWithGoogle()}
      />
      <OrDivider />
      <SecondaryButton
        disabled={googlePending}
        label="Create account with email"
        onPress={() => router.push("/auth/sign-up")}
      />
      <SecondaryButton
        disabled={googlePending}
        label="Sign in with email"
        onPress={() => router.push("/auth/sign-in")}
        style={styles.secondaryAction}
      />
      <SecondaryButton
        disabled={googlePending}
        label="See the introduction again"
        onPress={() => router.push("/intro/meet")}
        style={styles.revisit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  icon: {
    borderRadius: 34,
    height: 136,
    width: 136,
  },
  heading: {
    ...typography.screenTitle,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  secondaryAction: { marginTop: spacing.sm },
  revisit: { marginTop: spacing.xl },
});
