import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";

export interface AppHeaderAction {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  centered?: boolean;
  rightAction?: AppHeaderAction;
  rightAccessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function HeaderAction({ action }: { action: AppHeaderAction }) {
  const disabled = action.disabled || action.loading;

  return (
    <Pressable
      accessibilityLabel={action.accessibilityLabel ?? action.label}
      accessibilityRole="button"
      accessibilityState={{ busy: action.loading, disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.textAction,
        pressed && !disabled && styles.actionPressed,
        disabled && styles.actionDisabled,
      ]}
    >
      {action.loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text allowFontScaling style={styles.actionLabel}>
          {action.label}
        </Text>
      )}
    </Pressable>
  );
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Go back",
  centered = true,
  rightAction,
  rightAccessory,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.actionSlot}>
        {onBack ? (
          <Pressable
            accessibilityLabel={backLabel}
            accessibilityRole="button"
            hitSlop={4}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.actionPressed,
            ]}
          >
            <View accessibilityElementsHidden style={styles.chevron} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.copy, centered && styles.copyCentered]}>
        <Text
          accessibilityRole="header"
          allowFontScaling
          style={[styles.title, !centered && styles.copyLeft]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            allowFontScaling
            style={[styles.subtitle, !centered && styles.copyLeft]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.actionSlot, styles.actionSlotRight]}>
        {rightAccessory ?? (rightAction ? <HeaderAction action={rightAction} /> : null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 58,
    paddingVertical: spacing.xs,
    width: "100%",
  },
  actionSlot: {
    alignItems: "flex-start",
    justifyContent: "center",
    minWidth: layout.minTouchTarget,
  },
  actionSlotRight: {
    alignItems: "flex-end",
  },
  backButton: {
    alignItems: "center",
    borderRadius: radii.md,
    height: layout.minTouchTarget,
    justifyContent: "center",
    width: layout.minTouchTarget,
  },
  chevron: {
    borderBottomColor: colors.text,
    borderBottomWidth: 2.5,
    borderLeftColor: colors.text,
    borderLeftWidth: 2.5,
    height: 12,
    transform: [{ rotate: "45deg" }],
    width: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  copyCentered: {
    alignItems: "center",
  },
  copyLeft: {
    textAlign: "left",
  },
  title: {
    ...typography.cardTitle,
    textAlign: "center",
  },
  subtitle: {
    ...typography.caption,
    marginTop: 1,
    textAlign: "center",
  },
  textAction: {
    alignItems: "center",
    borderRadius: radii.md,
    justifyContent: "center",
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: spacing.sm,
  },
  actionPressed: {
    backgroundColor: colors.primarySoft,
  },
  actionDisabled: {
    opacity: 0.55,
  },
  actionLabel: {
    ...typography.label,
    color: colors.primary,
  },
});
