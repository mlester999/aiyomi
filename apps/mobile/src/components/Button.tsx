import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";

export interface ButtonProps
  extends Omit<PressableProps, "children" | "disabled" | "style"> {
  label: string;
  disabled?: boolean;
  fullWidth?: boolean;
  leadingAccessory?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

interface BaseButtonProps extends ButtonProps {
  variant: "primary" | "secondary";
}

function BaseButton({
  label,
  accessibilityLabel,
  disabled = false,
  fullWidth = true,
  leadingAccessory,
  loading = false,
  loadingLabel,
  onPress,
  style,
  labelStyle,
  variant,
  ...pressableProps
}: BaseButtonProps) {
  const isDisabled = disabled || loading;
  const visibleLabel = loading ? (loadingLabel ?? label) : label;
  const isPrimary = variant === "primary";

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel ?? visibleLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && !isDisabled &&
          (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={isPrimary ? colors.textInverse : colors.primary}
            size="small"
          />
        ) : (
          leadingAccessory
        )}
        <Text
          allowFontScaling
          style={[
            styles.label,
            isPrimary ? styles.primaryLabel : styles.secondaryLabel,
            labelStyle,
          ]}
        >
          {visibleLabel}
        </Text>
      </View>
    </Pressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <BaseButton {...props} variant="primary" />;
}

export function SecondaryButton(props: ButtonProps) {
  return <BaseButton {...props} variant="secondary" />;
}

export interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  variant?: "primary" | "secondary";
}

export function LoadingButton({
  variant = "primary",
  ...props
}: LoadingButtonProps) {
  return <BaseButton {...props} variant={variant} />;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    justifyContent: "center",
    minHeight: layout.buttonHeight,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
    borderColor: colors.primaryPressed,
    transform: [{ scale: 0.99 }],
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  secondaryPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
  },
  label: {
    ...typography.button,
    flexShrink: 1,
    textAlign: "center",
  },
  primaryLabel: {
    color: colors.textInverse,
  },
  secondaryLabel: {
    color: colors.primaryPressed,
  },
});
