import { companionNameSchema } from "@aiyomi/schemas";
import type { CompanionKey, CompanionPersonality } from "@aiyomi/types";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { COMPANION_CATALOG, CompanionIllustration } from "../../src/companions";
import { useUserCompanion } from "../../src/companions/useUserCompanion";
import {
  AppHeader,
  ChoiceCard,
  KeyboardScreen,
  LoadingButton,
  TextField,
} from "../../src/components";
import {
  playSelectionHaptic,
  playSuccessHaptic,
} from "../../src/feedback/haptics";
import { requireSupabase } from "../../src/lib/supabase";
import { useApp } from "../../src/providers/AppProvider";
import { colors, spacing, typography } from "../../src/theme";

const personalities: readonly {
  key: CompanionPersonality;
  title: string;
  description: string;
}[] = [
  { key: "gentle", title: "Gentle", description: "Calm support with fewer nudges." },
  { key: "balanced", title: "Balanced", description: "Encouragement with healthy accountability." },
  { key: "coach", title: "Coach", description: "More proactive and direct." },
];

export default function CompanionSettingsScreen() {
  const router = useRouter();
  const { session } = useApp();
  const { companion, loading, reload } = useUserCompanion();
  const [definitions, setDefinitions] = useState<
    Array<{ id: string; key: CompanionKey; active: boolean }>
  >([]);
  const [selectedKey, setSelectedKey] = useState<CompanionKey>("mori");
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState<CompanionPersonality>("balanced");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const saveInFlightRef = useRef(false);

  useEffect(() => {
    if (!companion) return;
    setSelectedKey(companion.key);
    setName(companion.customName);
    setPersonality(companion.personality);
  }, [companion]);

  useEffect(() => {
    void requireSupabase()
      .from("companion_definitions")
      .select("id,key,active")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) =>
        setDefinitions(
          ((data ?? []) as Array<{
            id: string;
            key: CompanionKey;
            active: boolean;
          }>).filter((definition) => definition.active),
        ),
      );
  }, []);

  const save = async () => {
    if (!session || saveInFlightRef.current) return;
    const validation = companionNameSchema.safeParse(name);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Check the companion name.");
      return;
    }
    const definition = definitions.find((item) => item.key === selectedKey);
    if (!definition) {
      setError("That companion isn't available right now.");
      return;
    }
    saveInFlightRef.current = true;
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const { error: updateError } = await requireSupabase()
        .from("user_companions")
        .update({
          companion_definition_id: definition.id,
          custom_name: validation.data,
          personality,
        })
        .eq("user_id", session.user.id);
      if (updateError) throw updateError;
      await reload();
      setSaved(true);
      void playSuccessHaptic();
    } catch {
      setError("Couldn't save your companion yet. Your choices are still here.");
    } finally {
      saveInFlightRef.current = false;
      setPending(false);
    }
  };

  return (
    <KeyboardScreen maxContentWidth={620}>
      <AppHeader
        onBack={pending ? undefined : () => router.back()}
        title="Companion"
      />
      {loading ? (
        <ActivityIndicator
          accessibilityLabel="Loading your companion"
          color={colors.primary}
          size="large"
        />
      ) : (
        <CompanionIllustration
          accessibilityLabel={`${name || "Your companion"} preview`}
          mood="happy"
          showAura
          size="large"
          variant={selectedKey}
        />
      )}
      <Text style={styles.section}>Companion</Text>
      <View style={styles.list} accessibilityRole="radiogroup">
        {COMPANION_CATALOG.filter((item) =>
          definitions.some((definition) => definition.key === item.id),
        ).map((item) => (
          <ChoiceCard
            key={item.id}
            description={item.flavor}
            disabled={pending}
            leading={<CompanionIllustration decorative size="tiny" variant={item.id} />}
            onPress={() => {
              setSelectedKey(item.id);
              void playSelectionHaptic();
            }}
            selected={selectedKey === item.id}
            title={item.name}
          />
        ))}
      </View>
      <TextField
        editable={!pending}
        error={error ?? undefined}
        label="Companion name"
        maxLength={40}
        onChangeText={setName}
        value={name}
      />
      <Text style={styles.section}>Support style</Text>
      <View style={styles.list} accessibilityRole="radiogroup">
        {personalities.map((item) => (
          <ChoiceCard
            key={item.key}
            description={item.description}
            disabled={pending}
            onPress={() => setPersonality(item.key)}
            selected={personality === item.key}
            title={item.title}
          />
        ))}
      </View>
      {saved ? <Text accessibilityLiveRegion="polite" style={styles.success}>Your companion is updated.</Text> : null}
      <LoadingButton
        label="Save companion"
        loading={pending}
        loadingLabel="Saving companion..."
        onPress={() => void save()}
      />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  section: { ...typography.sectionTitle, alignSelf: "stretch", fontSize: 18, marginBottom: spacing.sm, marginTop: spacing.xl },
  list: { gap: spacing.sm, width: "100%" },
  success: { ...typography.bodySmall, color: colors.success, marginVertical: spacing.md, textAlign: "center" },
});
