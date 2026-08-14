import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, radii } from "../theme";

export type NavigationIconName =
  | "today"
  | "companion"
  | "progress"
  | "me"
  | "add";

export interface NavigationIconProps {
  name: NavigationIconName;
  size?: number;
  color?: ColorValue;
  active?: boolean;
  decorative?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export type BottomNavigationIconProps = NavigationIconProps;

const TodayIcon = ({ color, stroke }: { color: ColorValue; stroke: number }) => (
  <View style={styles.shapeFill}>
    <View
      style={[
        styles.todayCore,
        { borderColor: color, borderWidth: stroke },
      ]}
    />
    <View style={[styles.rayVertical, styles.rayTop, { backgroundColor: color }]} />
    <View
      style={[styles.rayVertical, styles.rayBottom, { backgroundColor: color }]}
    />
    <View style={[styles.rayHorizontal, styles.rayLeft, { backgroundColor: color }]} />
    <View
      style={[styles.rayHorizontal, styles.rayRight, { backgroundColor: color }]}
    />
  </View>
);

const CompanionIcon = ({ color }: { color: ColorValue }) => (
  <View style={styles.shapeFill}>
    <View style={[styles.companionEar, styles.companionEarLeft, { backgroundColor: color }]} />
    <View style={[styles.companionEar, styles.companionEarRight, { backgroundColor: color }]} />
    <View style={[styles.companionHead, { backgroundColor: color }]}>
      <View style={[styles.companionEye, styles.companionEyeLeft]} />
      <View style={[styles.companionEye, styles.companionEyeRight]} />
    </View>
    <View style={[styles.companionBody, { backgroundColor: color }]} />
  </View>
);

const ProgressIcon = ({ color }: { color: ColorValue }) => (
  <View style={[styles.shapeFill, styles.progressRow]}>
    <View style={[styles.progressBar, styles.progressBarShort, { backgroundColor: color }]} />
    <View style={[styles.progressBar, styles.progressBarTall, { backgroundColor: color }]} />
    <View style={[styles.progressBar, styles.progressBarMedium, { backgroundColor: color }]} />
  </View>
);

const MeIcon = ({ color }: { color: ColorValue }) => (
  <View style={styles.shapeFill}>
    <View style={[styles.meHead, { backgroundColor: color }]} />
    <View style={[styles.meShoulders, { backgroundColor: color }]} />
  </View>
);

const AddIcon = ({ color }: { color: ColorValue }) => (
  <View style={styles.shapeFill}>
    <View style={[styles.addHorizontal, { backgroundColor: color }]} />
    <View style={[styles.addVertical, { backgroundColor: color }]} />
  </View>
);

const iconRenderers: Record<
  NavigationIconName,
  (color: ColorValue, stroke: number) => ReactNode
> = {
  today: (color, stroke) => <TodayIcon color={color} stroke={stroke} />,
  companion: (color) => <CompanionIcon color={color} />,
  progress: (color) => <ProgressIcon color={color} />,
  me: (color) => <MeIcon color={color} />,
  add: (color) => <AddIcon color={color} />,
};

export function NavigationIcon({
  name,
  size = 24,
  color = colors.textMuted,
  active = false,
  decorative = true,
  accessibilityLabel,
  style,
}: NavigationIconProps) {
  const stroke = Math.max(1.5, size / 14);
  const renderedColor = active ? colors.primary : color;

  return (
    <View
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      accessibilityRole={decorative ? undefined : "image"}
      accessible={!decorative}
      importantForAccessibility={decorative ? "no-hide-descendants" : "yes"}
      pointerEvents="none"
      style={[
        styles.container,
        active && styles.activeContainer,
        { height: size, width: size },
        style,
      ]}
    >
      {iconRenderers[name](renderedColor, stroke)}
      {active && name !== "add" ? <View style={styles.activeDot} /> : null}
    </View>
  );
}

export const BottomNavigationIcon = NavigationIcon;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeContainer: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
  },
  activeDot: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    bottom: -4,
    height: 3,
    position: "absolute",
    width: 10,
  },
  shapeFill: {
    height: "72%",
    position: "relative",
    width: "72%",
  },
  todayCore: {
    borderRadius: radii.pill,
    height: "50%",
    left: "25%",
    position: "absolute",
    top: "25%",
    width: "50%",
  },
  rayVertical: {
    borderRadius: radii.pill,
    height: "15%",
    left: "46%",
    position: "absolute",
    width: "8%",
  },
  rayTop: { top: "1%" },
  rayBottom: { bottom: "1%" },
  rayHorizontal: {
    borderRadius: radii.pill,
    height: "8%",
    position: "absolute",
    top: "46%",
    width: "15%",
  },
  rayLeft: { left: "1%" },
  rayRight: { right: "1%" },
  companionEar: {
    borderRadius: radii.pill,
    height: "30%",
    position: "absolute",
    top: "3%",
    width: "26%",
  },
  companionEarLeft: {
    left: "13%",
    transform: [{ rotate: "-28deg" }],
  },
  companionEarRight: {
    right: "13%",
    transform: [{ rotate: "28deg" }],
  },
  companionHead: {
    borderRadius: radii.pill,
    height: "54%",
    left: "18%",
    position: "absolute",
    top: "14%",
    width: "64%",
    zIndex: 2,
  },
  companionEye: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: "18%",
    position: "absolute",
    top: "42%",
    width: "11%",
  },
  companionEyeLeft: { left: "28%" },
  companionEyeRight: { right: "28%" },
  companionBody: {
    borderRadius: radii.pill,
    bottom: "3%",
    height: "40%",
    left: "26%",
    position: "absolute",
    width: "48%",
  },
  progressRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 2,
    justifyContent: "center",
  },
  progressBar: {
    borderRadius: radii.xs,
    width: "23%",
  },
  progressBarShort: { height: "42%" },
  progressBarTall: { height: "88%" },
  progressBarMedium: { height: "64%" },
  meHead: {
    borderRadius: radii.pill,
    height: "38%",
    left: "31%",
    position: "absolute",
    top: "4%",
    width: "38%",
  },
  meShoulders: {
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
    bottom: "3%",
    height: "48%",
    left: "10%",
    position: "absolute",
    width: "80%",
  },
  addHorizontal: {
    borderRadius: radii.pill,
    height: "14%",
    left: "7%",
    position: "absolute",
    top: "43%",
    width: "86%",
  },
  addVertical: {
    borderRadius: radii.pill,
    height: "86%",
    left: "43%",
    position: "absolute",
    top: "7%",
    width: "14%",
  },
});
