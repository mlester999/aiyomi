import type { ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { aiyomiMark } from "../../assets/brand";
import { KeyboardScreen } from "../../components";
import { colors, radii, spacing, typography } from "../../theme";

interface AuthScaffoldProps {
  title: string;
  body?: string;
  children: ReactNode;
}

export function AuthScaffold({ body, children, title }: AuthScaffoldProps) {
  return (
    <KeyboardScreen contentContainerStyle={styles.content} maxContentWidth={520}>
      <View style={styles.brandRow}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Aiyomi"
          resizeMode="contain"
          source={aiyomiMark}
          style={styles.icon}
        />
        <Text style={styles.brandName}>Aiyomi</Text>
      </View>
      <View style={styles.headingBlock}>
        <Text accessibilityRole="header" style={styles.heading}>
          {title}
        </Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
      </View>
      {children}
    </KeyboardScreen>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function OrDivider() {
  return (
    <View accessibilityElementsHidden style={styles.dividerRow}>
      <View style={styles.divider} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xl,
  },
  brandRow: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  icon: {
    borderRadius: 14,
    height: 46,
    width: 46,
  },
  brandName: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headingBlock: {
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
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
  error: {
    backgroundColor: colors.errorSoft,
    borderColor: "#E2B8B8",
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  divider: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSubtle,
  },
});
