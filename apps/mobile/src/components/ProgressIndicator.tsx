import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, radii, spacing, typography } from "../theme";

export interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ProgressIndicator({
  current,
  total,
  label,
  accessibilityLabel,
  style,
}: ProgressIndicatorProps) {
  const safeTotal = Math.max(1, Math.floor(total));
  const safeCurrent = Math.min(safeTotal, Math.max(0, Math.floor(current)));
  const percentage = Math.round((safeCurrent / safeTotal) * 100);
  const progressText = label ?? `${safeCurrent} of ${safeTotal}`;

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? `Onboarding progress, ${progressText}`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: safeTotal,
        min: 0,
        now: safeCurrent,
        text: progressText,
      }}
      style={[styles.container, style]}
    >
      <View style={styles.copyRow}>
        <Text allowFontScaling style={styles.label}>
          {progressText}
        </Text>
        <Text allowFontScaling style={styles.percentage}>
          {percentage}%
        </Text>
      </View>
      <View accessibilityElementsHidden style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%` as `${number}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  copyRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
  },
  percentage: {
    ...typography.caption,
    color: colors.primaryPressed,
  },
  track: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    height: 8,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: "100%",
  },
});
