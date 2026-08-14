import { Image, StyleSheet, Text, View } from "react-native";

import { aiyomiMark } from "../../assets/brand";
import { CompanionIllustration } from "../../companions";
import {
  PrimaryButton,
  ProgressIndicator,
  Screen,
  SecondaryButton,
} from "../../components";
import { colors, radii, shadows, spacing, typography } from "../../theme";

type PreviewKind = "companion" | "plan" | "focus" | "learn";

interface IntroStoryScreenProps {
  body: string;
  current: number;
  heading: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  preview: PreviewKind;
  primaryLabel: string;
  secondaryLabel?: string;
  children?: React.ReactNode;
}

function StoryPreview({ kind }: { kind: PreviewKind }) {
  if (kind === "companion") {
    return (
      <View style={[styles.preview, styles.companionPreview]}>
        <View style={styles.mintGlow} />
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Aiyomi companion greeting you"
          resizeMode="contain"
          source={aiyomiMark}
          style={styles.appIcon}
        />
        <View accessibilityElementsHidden style={styles.sparkle}>
          <Text style={styles.sparkleText}>✦</Text>
        </View>
      </View>
    );
  }

  if (kind === "plan") {
    return (
      <View
        accessibilityLabel="A calm preview of a realistic day plan"
        style={[styles.preview, styles.phonePreview]}
      >
        <View style={styles.previewHeader}>
          <Text style={styles.previewEyebrow}>TODAY</Text>
          <Text style={styles.previewTitle}>A day with breathing room</Text>
        </View>
        <View style={styles.timelineRow}>
          <Text style={styles.time}>9:00</Text>
          <View style={[styles.timelineCard, styles.skyCard]}>
            <Text style={styles.cardTitle}>Fixed time</Text>
            <Text style={styles.cardCopy}>Protected on your plan</Text>
          </View>
        </View>
        <View style={styles.timelineRow}>
          <Text style={styles.time}>1:30</Text>
          <View style={[styles.timelineCard, styles.mintCard]}>
            <Text style={styles.cardTitle}>Flexible space</Text>
            <Text style={styles.cardCopy}>Ready when life changes</Text>
          </View>
        </View>
      </View>
    );
  }

  if (kind === "focus") {
    return (
      <View
        accessibilityLabel="A companion focusing beside a timer and growing plant"
        style={[styles.preview, styles.focusPreview]}
      >
        <Text style={styles.previewEyebrow}>FOCUS TOGETHER</Text>
        <View style={styles.focusCenter}>
          <View style={styles.timerRing}>
            <Text style={styles.timer}>25:00</Text>
            <Text style={styles.timerLabel}>one small step</Text>
          </View>
          <CompanionIllustration
            decorative
            mood="focused"
            size={82}
            variant="mori"
          />
        </View>
        <View style={styles.growthRow}>
          <Text style={styles.plant}>🌱</Text>
          <Text style={styles.growthCopy}>
            Real-life progress drives virtual progress.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel="Aiyomi learning which support works for you"
      style={[styles.preview, styles.learnPreview]}
    >
      <View style={[styles.learningBubble, styles.bubbleOne]}>
        <Text style={styles.bubbleIcon}>☀️</Text>
        <View style={styles.bubbleCopy}>
          <Text style={styles.cardTitle}>Your best rhythm</Text>
          <Text style={styles.cardCopy}>Learned gently over time</Text>
        </View>
      </View>
      <View style={[styles.learningBubble, styles.bubbleTwo]}>
        <Text style={styles.bubbleIcon}>🫶</Text>
        <View style={styles.bubbleCopy}>
          <Text style={styles.cardTitle}>Realistic support</Text>
          <Text style={styles.cardCopy}>You stay in control</Text>
        </View>
      </View>
      <Text style={styles.learnFootnote}>
        Patterns become suggestions, never rules about you.
      </Text>
    </View>
  );
}

export function IntroStoryScreen({
  body,
  children,
  current,
  heading,
  onPrimary,
  onSecondary,
  preview,
  primaryLabel,
  secondaryLabel,
}: IntroStoryScreenProps) {
  return (
    <Screen scroll contentContainerStyle={styles.screenContent}>
      <ProgressIndicator
        accessibilityLabel={`Introduction, page ${current} of 4`}
        current={current}
        label={`${current} of 4`}
        total={4}
      />
      <StoryPreview kind={preview} />
      <View style={styles.copyBlock}>
        <Text accessibilityRole="header" style={styles.heading}>
          {heading}
        </Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      {children}
      <View style={styles.actions}>
        <PrimaryButton label={primaryLabel} onPress={onPrimary} />
        {secondaryLabel && onSecondary ? (
          <SecondaryButton label={secondaryLabel} onPress={onSecondary} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  preview: {
    alignSelf: "center",
    marginTop: spacing.xl,
    maxWidth: 460,
    minHeight: 230,
    overflow: "hidden",
    width: "100%",
  },
  companionPreview: {
    alignItems: "center",
    justifyContent: "center",
  },
  mintGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primarySoft,
  },
  appIcon: {
    width: 176,
    height: 176,
    borderRadius: 42,
    ...shadows.floating,
  },
  sparkle: {
    position: "absolute",
    right: "19%",
    top: 25,
  },
  sparkleText: {
    color: "#A86A2A",
    fontSize: 28,
  },
  phonePreview: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
  previewHeader: {
    marginBottom: spacing.lg,
  },
  previewEyebrow: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.2,
  },
  previewTitle: {
    ...typography.cardTitle,
    marginTop: spacing.xxs,
  },
  timelineRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  time: {
    ...typography.caption,
    paddingTop: spacing.sm,
    width: 38,
  },
  timelineCard: {
    borderRadius: radii.md,
    flex: 1,
    padding: spacing.md,
  },
  skyCard: { backgroundColor: "#E1F0F5" },
  mintCard: { backgroundColor: colors.primarySoft },
  cardTitle: { ...typography.label },
  cardCopy: { ...typography.caption, marginTop: 2 },
  focusPreview: {
    alignItems: "center",
    borderRadius: radii.xl,
    backgroundColor: "#EEE9FA",
    justifyContent: "center",
    padding: spacing.lg,
  },
  timerRing: {
    alignItems: "center",
    borderColor: "#8E7BC5",
    borderRadius: 78,
    borderWidth: 8,
    height: 156,
    justifyContent: "center",
    marginVertical: spacing.md,
    width: 156,
  },
  focusCenter: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  timer: {
    color: colors.text,
    fontSize: 34,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  timerLabel: { ...typography.caption, marginTop: 2 },
  growthRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    maxWidth: 300,
  },
  plant: { fontSize: 28 },
  growthCopy: { ...typography.bodySmall, flex: 1 },
  learnPreview: {
    borderRadius: radii.xl,
    backgroundColor: "#F8E8DD",
    justifyContent: "center",
    padding: spacing.lg,
  },
  learningBubble: {
    alignItems: "center",
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  bubbleOne: { backgroundColor: "#FFF7D9", marginRight: spacing.xl },
  bubbleTwo: {
    backgroundColor: colors.surface,
    marginLeft: spacing.xl,
    marginTop: spacing.sm,
  },
  bubbleIcon: { fontSize: 30 },
  bubbleCopy: { flex: 1 },
  learnFootnote: {
    ...typography.caption,
    marginTop: spacing.md,
    textAlign: "center",
  },
  copyBlock: {
    alignSelf: "center",
    marginTop: spacing.xl,
    maxWidth: 520,
  },
  heading: {
    ...typography.screenTitle,
    textAlign: "center",
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
