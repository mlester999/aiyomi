import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { safeAuthError } from "../../src/auth/errors";
import { authService } from "../../src/auth/service";
import { AppHeader, KeyboardScreen, LoadingButton } from "../../src/components";
import { useApp } from "../../src/providers/AppProvider";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { session, signOutLocally } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    if (!session) return;
    setPending(true);
    setError(null);
    try {
      const { error: authError } = await authService.signOut(session.user.id);
      if (authError) throw authError;
      await signOutLocally();
      router.replace("/");
    } catch (caught) {
      setError(safeAuthError(caught));
    } finally {
      setPending(false);
    }
  };

  return (
    <KeyboardScreen maxContentWidth={520}>
      <AppHeader onBack={() => router.back()} title="Account" />
      <View style={styles.card}>
        <Text style={styles.label}>Signed-in email</Text>
        <Text selectable style={styles.email}>{session?.user.email ?? "Not available"}</Text>
      </View>
      <Text style={styles.note}>
        Account deletion and data export require trusted server workflows. Their controls will appear here only when those workflows are ready.
      </Text>
      {error ? <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <LoadingButton
        label="Sign out"
        loading={pending}
        loadingLabel="Signing out..."
        onPress={() => void signOut()}
        style={styles.action}
        variant="secondary"
      />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, marginTop: spacing.lg, padding: spacing.lg },
  label: { ...typography.label, color: colors.textMuted },
  email: { ...typography.body, marginTop: spacing.xs },
  note: { ...typography.bodySmall, marginTop: spacing.lg },
  error: { ...typography.bodySmall, color: colors.error, marginTop: spacing.md },
  action: { marginTop: spacing.xl },
});
