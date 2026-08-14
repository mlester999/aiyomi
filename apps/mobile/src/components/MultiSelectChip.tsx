import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";

export interface MultiSelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  selectionMode?: "multiple" | "single";
  style?: StyleProp<ViewStyle>;
}

export function MultiSelectChip({
  label,
  selected,
  onPress,
  accessibilityLabel,
  disabled = false,
  selectionMode = "multiple",
  style,
}: MultiSelectChipProps) {
  const isSingleChoice = selectionMode === "single";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={isSingleChoice ? "radio" : "checkbox"}
      accessibilityState={
        isSingleChoice
          ? { disabled, selected }
          : { checked: selected, disabled }
      }
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && !disabled && styles.chipPressed,
        disabled && styles.chipDisabled,
        style,
      ]}
    >
      {selected ? (
        <View accessibilityElementsHidden style={styles.checkBadge}>
          <Text style={styles.check}>✓</Text>
        </View>
      ) : null}
      <Text
        allowFontScaling
        style={[styles.label, selected && styles.labelSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipPressed: {
    backgroundColor: colors.surfacePressed,
    transform: [{ scale: 0.98 }],
  },
  chipDisabled: {
    opacity: 0.5,
  },
  checkBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  check: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 15,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.primaryPressed,
  },
});
