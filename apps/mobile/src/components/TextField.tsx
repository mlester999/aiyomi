import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";

export interface TextFieldProps
  extends Omit<TextInputProps, "accessibilityLabel" | "style"> {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
  helperText?: string;
  inputStyle?: StyleProp<TextStyle>;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
}

export function TextField({
  label,
  containerStyle,
  editable = true,
  error,
  helperText,
  inputStyle,
  leftAccessory,
  onBlur,
  onFocus,
  rightAccessory,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const guidance = error ?? helperText;

  return (
    <View style={[styles.field, containerStyle]}>
      <Text allowFontScaling style={styles.label}>
        {label}
      </Text>
      <View
        style={[
          styles.inputShell,
          focused && styles.inputShellFocused,
          Boolean(error) && styles.inputShellError,
          !editable && styles.inputShellDisabled,
        ]}
      >
        {leftAccessory ? (
          <View accessibilityElementsHidden style={styles.accessory}>
            {leftAccessory}
          </View>
        ) : null}
        <TextInput
          {...inputProps}
          accessibilityHint={guidance ?? inputProps.accessibilityHint}
          accessibilityLabel={label}
          accessibilityState={{ disabled: !editable }}
          allowFontScaling={inputProps.allowFontScaling ?? true}
          editable={editable}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={inputProps.placeholderTextColor ?? colors.textSubtle}
          selectionColor={inputProps.selectionColor ?? colors.primary}
          style={[styles.input, inputStyle]}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
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

export interface PasswordFieldProps
  extends Omit<TextFieldProps, "rightAccessory" | "secureTextEntry"> {
  initiallyVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export function PasswordField({
  initiallyVisible = false,
  onVisibilityChange,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(initiallyVisible);

  return (
    <TextField
      {...props}
      autoCapitalize={props.autoCapitalize ?? "none"}
      autoCorrect={props.autoCorrect ?? false}
      rightAccessory={
        <Pressable
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          accessibilityRole="button"
          accessibilityState={{ expanded: visible }}
          hitSlop={2}
          onPress={() => {
            const nextVisible = !visible;
            setVisible(nextVisible);
            onVisibilityChange?.(nextVisible);
          }}
          style={({ pressed }) => [
            styles.visibilityButton,
            pressed && styles.visibilityButtonPressed,
          ]}
        >
          <Text allowFontScaling style={styles.visibilityLabel}>
            {visible ? "Hide" : "Show"}
          </Text>
        </Pressable>
      }
      secureTextEntry={!visible}
    />
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
  inputShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1.5,
    flexDirection: "row",
    minHeight: layout.inputHeight,
    overflow: "hidden",
  },
  inputShellFocused: {
    borderColor: colors.focusRing,
  },
  inputShellError: {
    borderColor: colors.error,
  },
  inputShellDisabled: {
    backgroundColor: colors.disabledSurface,
    opacity: 0.72,
  },
  input: {
    ...typography.body,
    flex: 1,
    minHeight: layout.inputHeight - 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accessory: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
  },
  guidance: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.error,
  },
  visibilityButton: {
    alignItems: "center",
    borderRadius: radii.sm,
    justifyContent: "center",
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: spacing.sm,
  },
  visibilityButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  visibilityLabel: {
    ...typography.label,
    color: colors.primaryPressed,
  },
});
