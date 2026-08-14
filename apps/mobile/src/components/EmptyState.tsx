import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";
import { PrimaryButton, SecondaryButton, type ButtonProps } from "./Button";

export type EmptyStateAction = Pick<
  ButtonProps,
  "accessibilityLabel" | "disabled" | "label" | "loading" | "loadingLabel" | "onPress"
>;

export interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {illustration ? <View style={styles.illustration}>{illustration}</View> : null}
      <Text accessibilityRole="header" allowFontScaling style={styles.title}>
        {title}
      </Text>
      <Text allowFontScaling style={styles.description}>
        {description}
      </Text>
      {primaryAction || secondaryAction ? (
        <View style={styles.actions}>
          {primaryAction ? <PrimaryButton {...primaryAction} /> : null}
          {secondaryAction ? <SecondaryButton {...secondaryAction} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    maxWidth: layout.maxReadingWidth,
    padding: spacing.xl,
    width: "100%",
  },
  illustration: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sectionTitle,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    width: "100%",
  },
});
