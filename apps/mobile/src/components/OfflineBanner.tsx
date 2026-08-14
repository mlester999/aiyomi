import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, layout, radii, spacing, typography } from "../theme";

export interface OfflineBannerProps {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function OfflineBanner({
  visible,
  message = "You're offline. We'll keep what we can ready for you.",
  onRetry,
  retryLabel = "Try again",
  style,
}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.banner, style]}
    >
      <View accessibilityElementsHidden style={styles.icon}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text allowFontScaling style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retry,
            pressed && styles.retryPressed,
          ]}
        >
          <Text allowFontScaling style={styles.retryLabel}>
            {retryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    backgroundColor: colors.warningSoft,
    borderColor: "#E4C66F",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: "100%",
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.warning,
    borderRadius: radii.pill,
    height: 24,
    justifyContent: "center",
    marginRight: spacing.sm,
    width: 24,
  },
  iconText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 18,
  },
  message: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  retry: {
    alignItems: "center",
    borderRadius: radii.sm,
    justifyContent: "center",
    marginLeft: spacing.xs,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.sm,
  },
  retryPressed: {
    backgroundColor: "rgba(139, 100, 27, 0.12)",
  },
  retryLabel: {
    ...typography.label,
    color: colors.warning,
  },
});
