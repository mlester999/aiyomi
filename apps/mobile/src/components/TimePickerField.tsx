import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";

export interface TimePickerFieldProps {
  label: string;
  value: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  timezoneLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function ClockIcon() {
  return (
    <View accessibilityElementsHidden style={styles.clock}>
      <View style={styles.clockHour} />
      <View style={styles.clockMinute} />
    </View>
  );
}

export function TimePickerField({
  label,
  value,
  onPress,
  accessibilityLabel,
  disabled = false,
  error,
  helperText,
  timezoneLabel,
  style,
}: TimePickerFieldProps) {
  const guidance = error ?? helperText;
  const spokenLabel = accessibilityLabel ??
    [label, value, timezoneLabel].filter(Boolean).join(", ");

  return (
    <View style={[styles.field, style]}>
      <Text allowFontScaling style={styles.label}>
        {label}
      </Text>
      <Pressable
        accessibilityHint={guidance}
        accessibilityLabel={spokenLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.control,
          Boolean(error) && styles.controlError,
          pressed && !disabled && styles.controlPressed,
          disabled && styles.controlDisabled,
        ]}
      >
        <ClockIcon />
        <View style={styles.copy}>
          <Text allowFontScaling style={styles.value}>
            {value}
          </Text>
          {timezoneLabel ? (
            <Text allowFontScaling style={styles.timezone}>
              {timezoneLabel}
            </Text>
          ) : null}
        </View>
        <View accessibilityElementsHidden style={styles.chevron} />
      </Pressable>
      {guidance ? (
        <Text
          accessibilityLiveRegion={error ? "polite" : "none"}
          accessibilityRole={error ? "alert" : undefined}
          allowFontScaling
          style={[styles.guidance, error && styles.error]}
        >
          {guidance}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: "100%",
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  control: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1.5,
    flexDirection: "row",
    minHeight: layout.inputHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  controlError: {
    borderColor: colors.error,
  },
  controlPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  controlDisabled: {
    backgroundColor: colors.disabledSurface,
    opacity: 0.7,
  },
  clock: {
    borderColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1.8,
    height: 23,
    marginRight: spacing.sm,
    position: "relative",
    width: 23,
  },
  clockHour: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 7,
    left: 10,
    position: "absolute",
    top: 4,
    width: 2,
  },
  clockMinute: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 2,
    left: 10,
    position: "absolute",
    top: 10,
    transform: [{ rotate: "22deg" }],
    transformOrigin: "left center",
    width: 6,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    ...typography.body,
    fontWeight: "700",
  },
  timezone: {
    ...typography.caption,
    marginTop: 1,
  },
  chevron: {
    borderBottomColor: colors.textMuted,
    borderBottomWidth: 2,
    borderRightColor: colors.textMuted,
    borderRightWidth: 2,
    height: 9,
    marginLeft: spacing.sm,
    transform: [{ rotate: "45deg" }],
    width: 9,
  },
  guidance: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.error,
  },
});
