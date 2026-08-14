import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { safeAuthError } from "../../src/auth/errors";
import { authService } from "../../src/auth/service";
import { PrimaryButton, Screen, SecondaryButton } from "../../src/components";
import { colors, spacing, typography } from "../../src/theme";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const currentUrl = Linking.useURL();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const url = currentUrl ?? (await Linking.getInitialURL());
      if (!url) throw new Error("The sign-in link is incomplete.");
      const kind = await authService.consumeCallback(url);
      if (!active) return;
      router.replace(kind === "recovery" ? "/auth/update-password" : "/");
    })().catch((caught) => {
      if (active) setError(safeAuthError(caught));
    });

    return () => {
      active = false;
    };
  }, [currentUrl, router]);

  return (
    <Screen contentContainerStyle={styles.content} maxContentWidth={480}>
      {error ? (
        <View>
          <Text accessibilityRole="header" style={styles.heading}>
            This link needs another try.
          </Text>
          <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.body}>
            {error}
          </Text>
          <PrimaryButton label="Return to sign in" onPress={() => router.replace("/auth/sign-in")} />
          <SecondaryButton
            label="Request a new reset link"
            onPress={() => router.replace("/auth/forgot-password")}
            style={styles.secondary}
          />
        </View>
      ) : (
        <View accessibilityLiveRegion="polite" style={styles.loading}>
          <ActivityIndicator
            accessibilityLabel="Finishing secure sign-in"
            color={colors.primary}
            size="large"
          />
          <Text accessibilityRole="header" style={styles.heading}>
            Finishing securely...
          </Text>
          <Text style={styles.body}>Aiyomi is checking your link.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center" },
  loading: { alignItems: "center" },
  heading: { ...typography.screenTitle, marginBottom: spacing.sm, marginTop: spacing.lg, textAlign: "center" },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl, textAlign: "center" },
  secondary: { marginTop: spacing.sm },
});
