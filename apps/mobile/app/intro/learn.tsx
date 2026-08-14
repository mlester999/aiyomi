import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import type { PreAuthIntent } from "@aiyomi/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { trackMobileEvent } from "../../src/analytics/mobile";
import { MultiSelectChip } from "../../src/components";
import { IntroStoryScreen } from "../../src/features/intro/IntroStoryScreen";
import { useApp } from "../../src/providers/AppProvider";
import { colors, spacing, typography } from "../../src/theme";

const intents: readonly { key: PreAuthIntent; label: string }[] = [
  { key: "get_organized", label: "Get organized" },
  { key: "build_routines", label: "Build routines" },
  { key: "focus_better", label: "Focus better" },
  { key: "reach_a_goal", label: "Reach a goal" },
  { key: "balance_my_life", label: "Balance my life" },
  { key: "something_else", label: "Something else" },
];

export default function LearningCompanionScreen() {
  const router = useRouter();
  const { finishIntro, preAuthIntent } = useApp();
  const [intent, setIntent] = useState<PreAuthIntent | null>(
    preAuthIntent as PreAuthIntent | null,
  );

  const complete = async (destination: "/auth/welcome" | "/auth/sign-in") => {
    await finishIntro(intent);
    trackMobileEvent(ANALYTICS_EVENTS.INTRO_COMPLETED, {
      intentProvided: intent !== null,
      outcome: "completed",
    });
    router.replace(destination);
  };

  return (
    <IntroStoryScreen
      body="Over time, Aiyomi learns when you focus best, which routines help, and how much fits into your day. You can change every preference later."
      current={4}
      heading="Aiyomi gets better at helping you."
      onPrimary={() => void complete("/auth/welcome")}
      onSecondary={() => void complete("/auth/sign-in")}
      preview="learn"
      primaryLabel="Get Started"
      secondaryLabel="Already have an account? Sign in"
    >
      <View style={styles.intentBlock}>
        <Text style={styles.intentLabel}>
          Optional: What would you like help with most?
        </Text>
        <View style={styles.intentChips}>
          {intents.map((item) => (
            <MultiSelectChip
              key={item.key}
              label={item.label}
              onPress={() => setIntent(intent === item.key ? null : item.key)}
              selected={intent === item.key}
              selectionMode="single"
            />
          ))}
        </View>
      </View>
    </IntroStoryScreen>
  );
}

const styles = StyleSheet.create({
  intentBlock: {
    alignSelf: "center",
    marginTop: spacing.xl,
    maxWidth: 520,
    width: "100%",
  },
  intentLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  intentChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
});
