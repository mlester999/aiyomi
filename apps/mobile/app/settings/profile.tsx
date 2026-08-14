import { preferredNameSchema } from "@aiyomi/schemas";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppHeader, KeyboardScreen, LoadingButton, TextField } from "../../src/components";
import { requireSupabase } from "../../src/lib/supabase";
import { useApp } from "../../src/providers/AppProvider";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { profile, session, reloadProfile } = useApp();
  const [name, setName] = useState(profile?.first_name ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setName(profile?.first_name ?? ""), [profile?.first_name]);

  const save = async () => {
    if (!session) return;
    const validation = preferredNameSchema.safeParse(name);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Check your name and try again.");
      return;
    }
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const { error: updateError } = await requireSupabase()
        .from("profiles")
        .update({ first_name: validation.data })
        .eq("id", session.user.id);
      if (updateError) throw updateError;
      await reloadProfile();
      setSaved(true);
    } catch {
      setError("Couldn't save that yet. Your name is still here, so you can try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <KeyboardScreen maxContentWidth={520}>
      <AppHeader onBack={() => router.back()} title="Profile" />
      <Text style={styles.body}>Choose the name Aiyomi uses when speaking with you.</Text>
      <TextField
        autoCapitalize="words"
        error={error ?? undefined}
        label="Preferred name"
        maxLength={80}
        onChangeText={setName}
        value={name}
      />
      {saved ? (
        <Text accessibilityLiveRegion="polite" style={styles.success}>Your profile is updated.</Text>
      ) : null}
      <LoadingButton
        label="Save profile"
        loading={pending}
        loadingLabel="Saving profile..."
        onPress={() => void save()}
        style={styles.action}
      />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl, marginTop: spacing.md },
  success: { ...typography.bodySmall, backgroundColor: colors.successSoft, borderRadius: radii.md, color: colors.success, marginTop: spacing.md, padding: spacing.md },
  action: { marginTop: spacing.xl },
});
