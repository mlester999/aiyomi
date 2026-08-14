import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";

export interface NotificationPreferenceRowProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NotificationPreferenceRow({
  title,
  description,
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
  style,
}: NotificationPreferenceRowProps) {
  const spokenLabel = accessibilityLabel ??
    [title, description].filter(Boolean).join(", ");

  return (
    <Pressable
      accessibilityLabel={spokenLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.rowPressed,
        disabled && styles.rowDisabled,
        style,
      ]}
    >
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
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={styles.switchTarget}
      >
        <Switch
          disabled={disabled}
          ios_backgroundColor={colors.borderStrong}
          onValueChange={onValueChange}
          thumbColor={colors.surface}
          trackColor={{ false: colors.borderStrong, true: colors.primary }}
          value={value}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: "100%",
  },
  rowPressed: {
    backgroundColor: colors.primarySoft,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.md,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 16,
  },
  description: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  switchTarget: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: layout.minTouchTarget,
    minWidth: 52,
  },
});
