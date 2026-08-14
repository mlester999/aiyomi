import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, shadows, spacing, typography } from "../theme";

export interface ChoiceCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ChoiceCard({
  title,
  description,
  selected,
  onPress,
  accessibilityLabel,
  disabled = false,
  leading,
  style,
}: ChoiceCardProps) {
  const spokenLabel = accessibilityLabel ??
    [title, description].filter(Boolean).join(", ");

  return (
    <Pressable
      accessibilityLabel={spokenLabel}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && !disabled && styles.cardPressed,
        disabled && styles.cardDisabled,
        style,
      ]}
    >
      {leading ? (
        <View accessibilityElementsHidden style={styles.leading}>
          {leading}
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text allowFontScaling style={styles.title}>
          {title}
        </Text>
        {description ? (
          <Text allowFontScaling style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        accessibilityElementsHidden
        style={[styles.selection, selected && styles.selectionSelected]}
      >
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    flexDirection: "row",
    minHeight: 76,
    padding: spacing.md,
    width: "100%",
  },
  cardSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  cardPressed: {
    backgroundColor: colors.surfacePressed,
    transform: [{ scale: 0.995 }],
  },
  cardDisabled: {
    opacity: 0.5,
  },
  leading: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.cardTitle,
  },
  description: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  selection: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    height: 28,
    justifyContent: "center",
    marginLeft: spacing.md,
    width: 28,
  },
  selectionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  check: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 19,
  },
});
