import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, radii } from "../theme";
import {
  getCompanionDefinition,
  type CompanionId,
} from "./catalog";

export type CompanionSize = "tiny" | "small" | "medium" | "large" | "hero";

export type CompanionMood =
  | "happy"
  | "calm"
  | "focused"
  | "sleepy"
  | "thoughtful"
  | "proud"
  | "celebrating";

export interface CompanionIllustrationProps {
  variant?: CompanionId;
  size?: CompanionSize | number;
  mood?: CompanionMood;
  decorative?: boolean;
  accessibilityLabel?: string;
  showAura?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizeValues: Record<CompanionSize, number> = {
  tiny: 56,
  small: 88,
  medium: 136,
  large: 196,
  hero: 264,
};

const resolveSize = (size: CompanionSize | number) =>
  typeof size === "number" ? Math.max(48, size) : sizeValues[size];

type Scale = (value: number) => number;

function MoriDetails({ scale, color }: { scale: Scale; color: typeof colors.companion.mori }) {
  return (
    <>
      <View
        style={[
          styles.stem,
          {
            backgroundColor: color.deep,
            height: scale(26),
            left: scale(97),
            top: scale(28),
            width: scale(7),
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          {
            backgroundColor: color.base,
            borderColor: color.deep,
            borderWidth: scale(1.2),
            height: scale(27),
            left: scale(60),
            top: scale(19),
            transform: [{ rotate: "-25deg" }],
            width: scale(48),
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafMirrored,
          {
            backgroundColor: color.light,
            borderColor: color.deep,
            borderWidth: scale(1.2),
            height: scale(30),
            left: scale(96),
            top: scale(11),
            transform: [{ rotate: "28deg" }],
            width: scale(51),
          },
        ]}
      />
      <View
        style={[
          styles.moriEar,
          {
            backgroundColor: color.accent,
            height: scale(46),
            left: scale(27),
            top: scale(70),
            transform: [{ rotate: "-31deg" }],
            width: scale(32),
          },
        ]}
      />
      <View
        style={[
          styles.moriEar,
          styles.moriEarRight,
          {
            backgroundColor: color.accent,
            height: scale(46),
            right: scale(27),
            top: scale(70),
            transform: [{ rotate: "31deg" }],
            width: scale(32),
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.tail,
          {
            backgroundColor: color.accent,
            borderColor: color.deep,
            borderWidth: scale(1.2),
            bottom: scale(34),
            height: scale(34),
            right: scale(17),
            transform: [{ rotate: "32deg" }],
            width: scale(48),
          },
        ]}
      />
    </>
  );
}

function LumiDetails({ scale, color }: { scale: Scale; color: typeof colors.companion.lumi }) {
  const point = (left: number, top: number, rotate: string, pointScale = 1) => (
    <View
      style={[
        styles.starPoint,
        {
          borderBottomColor: color.base,
          borderBottomWidth: scale(42 * pointScale),
          borderLeftWidth: scale(17 * pointScale),
          borderRightWidth: scale(17 * pointScale),
          left: scale(left),
          top: scale(top),
          transform: [{ rotate }],
        },
      ]}
    />
  );

  return (
    <>
      {point(83, 12, "-4deg", 1.05)}
      {point(54, 30, "-35deg", 0.9)}
      {point(112, 28, "34deg", 0.9)}
      <View
        style={[
          styles.lumiTail,
          {
            borderColor: color.deep,
            borderLeftColor: colors.transparent,
            borderWidth: scale(10),
            bottom: scale(32),
            height: scale(57),
            right: scale(9),
            transform: [{ rotate: "20deg" }],
            width: scale(57),
          },
        ]}
      />
      <View
        style={[
          styles.signatureDot,
          {
            backgroundColor: "#FFF8D7",
            height: scale(8),
            left: scale(97),
            top: scale(70),
            width: scale(8),
          },
        ]}
      />
      <View
        style={[
          styles.signatureDot,
          {
            backgroundColor: "#FFF8D7",
            height: scale(4),
            left: scale(84),
            top: scale(78),
            width: scale(4),
          },
        ]}
      />
      <View
        style={[
          styles.signatureDot,
          {
            backgroundColor: "#FFF8D7",
            height: scale(4),
            left: scale(112),
            top: scale(79),
            width: scale(4),
          },
        ]}
      />
    </>
  );
}

function PikoDetails({ scale, color }: { scale: Scale; color: typeof colors.companion.piko }) {
  return (
    <>
      <View
        style={[
          styles.pikoCrest,
          {
            backgroundColor: color.accent,
            height: scale(23),
            left: scale(65),
            top: scale(36),
            transform: [{ rotate: "-18deg" }],
            width: scale(60),
          },
        ]}
      />
      <View
        style={[
          styles.pikoCrest,
          {
            backgroundColor: color.light,
            height: scale(18),
            left: scale(95),
            top: scale(30),
            transform: [{ rotate: "8deg" }],
            width: scale(52),
          },
        ]}
      />
      <View
        style={[
          styles.pikoPuff,
          {
            backgroundColor: color.accent,
            height: scale(50),
            left: scale(15),
            top: scale(79),
            width: scale(50),
          },
        ]}
      />
      <View
        style={[
          styles.pikoPuff,
          {
            backgroundColor: color.light,
            height: scale(45),
            right: scale(15),
            top: scale(75),
            width: scale(45),
          },
        ]}
      />
      <View
        style={[
          styles.pikoTail,
          {
            backgroundColor: color.accent,
            bottom: scale(42),
            height: scale(29),
            right: scale(4),
            transform: [{ rotate: "17deg" }],
            width: scale(65),
          },
        ]}
      />
      <View
        style={[
          styles.pikoStripe,
          {
            backgroundColor: color.deep,
            height: scale(6),
            left: scale(69),
            top: scale(76),
            transform: [{ rotate: "-16deg" }],
            width: scale(27),
          },
        ]}
      />
    </>
  );
}

function Face({
  scale,
  mood,
  variant,
}: {
  scale: Scale;
  mood: CompanionMood;
  variant: CompanionId;
}) {
  const color = colors.companion[variant];
  const closedLeft = mood === "sleepy" || mood === "calm" || mood === "proud";
  const closedRight =
    closedLeft || mood === "celebrating" || (variant === "piko" && mood === "happy");
  const focused = mood === "focused";
  const thoughtful = mood === "thoughtful";

  const eyeStyle = (closed: boolean, side: "left" | "right"): ViewStyle => ({
    backgroundColor: color.deep,
    borderRadius: radii.pill,
    height: scale(closed ? 3.5 : focused ? 13 : 16),
    left: scale(side === "left" ? 76 : 117),
    position: "absolute",
    top: scale(closed ? 107 : 99),
    transform: closed
      ? [{ rotate: side === "left" ? "7deg" : "-7deg" }]
      : undefined,
    width: scale(closed ? 15 : focused ? 8 : 10),
    zIndex: 8,
  });

  return (
    <>
      <View style={eyeStyle(closedLeft, "left")} />
      <View style={eyeStyle(closedRight, "right")} />
      {focused || thoughtful ? (
        <>
          <View
            style={[
              styles.brow,
              {
                backgroundColor: color.deep,
                height: scale(3),
                left: scale(72),
                top: scale(91),
                transform: [{ rotate: focused ? "12deg" : "-6deg" }],
                width: scale(18),
              },
            ]}
          />
          <View
            style={[
              styles.brow,
              {
                backgroundColor: color.deep,
                height: scale(3),
                left: scale(115),
                top: scale(91),
                transform: [{ rotate: focused ? "-12deg" : "6deg" }],
                width: scale(18),
              },
            ]}
          />
        </>
      ) : null}
      <View
        style={[
          styles.cheek,
          {
            backgroundColor: color.cheek,
            height: scale(8),
            left: scale(63),
            top: scale(118),
            width: scale(13),
          },
        ]}
      />
      <View
        style={[
          styles.cheek,
          {
            backgroundColor: color.cheek,
            height: scale(8),
            left: scale(132),
            top: scale(118),
            width: scale(13),
          },
        ]}
      />
      <Mouth color={color.deep} mood={mood} scale={scale} />
    </>
  );
}

function Mouth({
  color,
  mood,
  scale,
}: {
  color: string;
  mood: CompanionMood;
  scale: Scale;
}) {
  if (mood === "celebrating") {
    return (
      <View
        style={[
          styles.openMouth,
          {
            backgroundColor: color,
            height: scale(17),
            left: scale(94),
            top: scale(117),
            width: scale(18),
          },
        ]}
      />
    );
  }

  if (mood === "focused" || mood === "thoughtful" || mood === "sleepy") {
    return (
      <View
        style={[
          styles.neutralMouth,
          {
            backgroundColor: color,
            height: scale(3),
            left: scale(mood === "thoughtful" ? 97 : 94),
            top: scale(122),
            transform: mood === "thoughtful" ? [{ rotate: "-8deg" }] : undefined,
            width: scale(mood === "sleepy" ? 13 : 18),
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.smile,
        {
          borderBottomColor: color,
          borderBottomWidth: scale(2.5),
          borderLeftColor: color,
          borderLeftWidth: scale(2.5),
          borderRightColor: color,
          borderRightWidth: scale(2.5),
          height: scale(10),
          left: scale(93),
          top: scale(116),
          width: scale(21),
        },
      ]}
    />
  );
}

export function CompanionIllustration({
  variant = "mori",
  size = "medium",
  mood = "happy",
  decorative = false,
  accessibilityLabel,
  showAura = true,
  style,
}: CompanionIllustrationProps) {
  const resolvedSize = resolveSize(size);
  const ratio = resolvedSize / 200;
  const scale = (value: number) => value * ratio;
  const color = colors.companion[variant];
  const definition = getCompanionDefinition(variant);
  const bodyGeometry: Record<CompanionId, ViewStyle> = {
    mori: {
      borderBottomLeftRadius: scale(52),
      borderBottomRightRadius: scale(61),
      borderTopLeftRadius: scale(61),
      borderTopRightRadius: scale(55),
      height: scale(124),
      left: scale(41),
      top: scale(49),
      width: scale(118),
    },
    lumi: {
      borderBottomLeftRadius: scale(54),
      borderBottomRightRadius: scale(62),
      borderTopLeftRadius: scale(67),
      borderTopRightRadius: scale(67),
      height: scale(114),
      left: scale(34),
      top: scale(59),
      width: scale(132),
    },
    piko: {
      borderBottomLeftRadius: scale(49),
      borderBottomRightRadius: scale(62),
      borderTopLeftRadius: scale(64),
      borderTopRightRadius: scale(58),
      height: scale(106),
      left: scale(25),
      top: scale(67),
      transform: [{ rotate: "-2deg" }],
      width: scale(150),
    },
  };

  return (
    <View
      accessibilityLabel={
        decorative
          ? undefined
          : (accessibilityLabel ?? definition.accessibilityLabel)
      }
      accessibilityRole={decorative ? undefined : "image"}
      accessible={!decorative}
      importantForAccessibility={decorative ? "no-hide-descendants" : "yes"}
      style={[styles.stage, { height: resolvedSize, width: resolvedSize }, style]}
    >
      {showAura ? (
        <View
          accessibilityElementsHidden
          style={[
            styles.aura,
            {
              backgroundColor: color.light,
              height: scale(166),
              left: scale(17),
              top: scale(8),
              width: scale(166),
            },
          ]}
        />
      ) : null}
      <View
        accessibilityElementsHidden
        style={[
          styles.shadow,
          {
            height: scale(19),
            left: scale(48),
            top: scale(166),
            width: scale(104),
          },
        ]}
      />

      {variant === "mori" ? (
        <MoriDetails color={colors.companion.mori} scale={scale} />
      ) : null}
      {variant === "lumi" ? (
        <LumiDetails color={colors.companion.lumi} scale={scale} />
      ) : null}
      {variant === "piko" ? (
        <PikoDetails color={colors.companion.piko} scale={scale} />
      ) : null}

      <View
        style={[
          styles.body,
          bodyGeometry[variant],
          {
            backgroundColor: color.base,
            borderColor: color.deep,
            borderWidth: scale(1.4),
            shadowColor: color.deep,
            shadowOffset: { height: scale(8), width: 0 },
            shadowRadius: scale(13),
          },
        ]}
      >
        <View
          style={[
            styles.highlight,
            {
              backgroundColor: color.light,
              height: scale(59),
              left: scale(-6),
              top: scale(-12),
              width: scale(67),
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.arm,
          {
            backgroundColor: color.base,
            height: scale(42),
            left: scale(34),
            top: scale(111),
            transform: [{ rotate: mood === "celebrating" ? "52deg" : "24deg" }],
            width: scale(18),
          },
        ]}
      />
      <View
        style={[
          styles.arm,
          {
            backgroundColor: color.base,
            height: scale(42),
            right: scale(34),
            top: scale(mood === "celebrating" ? 90 : 111),
            transform: [{ rotate: mood === "celebrating" ? "-132deg" : "-24deg" }],
            width: scale(18),
          },
        ]}
      />

      <Face mood={mood} scale={scale} variant={variant} />

      <View
        style={[
          styles.foot,
          {
            backgroundColor: color.deep,
            bottom: scale(17),
            height: scale(17),
            left: scale(55),
            transform: [{ rotate: "-7deg" }],
            width: scale(39),
          },
        ]}
      />
      <View
        style={[
          styles.foot,
          {
            backgroundColor: color.deep,
            bottom: scale(17),
            height: scale(17),
            right: scale(55),
            transform: [{ rotate: "7deg" }],
            width: scale(39),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  aura: {
    borderRadius: radii.pill,
    opacity: 0.64,
    position: "absolute",
  },
  shadow: {
    backgroundColor: "rgba(53, 78, 69, 0.13)",
    borderRadius: radii.pill,
    position: "absolute",
  },
  body: {
    elevation: 3,
    overflow: "hidden",
    position: "absolute",
    shadowOpacity: 0.14,
    zIndex: 4,
  },
  highlight: {
    borderRadius: radii.pill,
    opacity: 0.42,
    position: "absolute",
  },
  stem: {
    borderRadius: radii.pill,
    position: "absolute",
    transform: [{ rotate: "-3deg" }],
    zIndex: 2,
  },
  leaf: {
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 20,
    position: "absolute",
    zIndex: 3,
  },
  leafMirrored: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 999,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 999,
  },
  moriEar: {
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 20,
    position: "absolute",
    zIndex: 2,
  },
  moriEarRight: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 999,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 999,
  },
  tail: {
    zIndex: 1,
  },
  starPoint: {
    borderLeftColor: colors.transparent,
    borderRightColor: colors.transparent,
    borderStyle: "solid",
    height: 0,
    position: "absolute",
    width: 0,
    zIndex: 2,
  },
  lumiTail: {
    borderRadius: radii.pill,
    position: "absolute",
    zIndex: 1,
  },
  signatureDot: {
    borderRadius: radii.pill,
    position: "absolute",
    zIndex: 7,
  },
  pikoCrest: {
    borderRadius: radii.pill,
    position: "absolute",
    zIndex: 2,
  },
  pikoPuff: {
    borderRadius: radii.pill,
    position: "absolute",
    zIndex: 2,
  },
  pikoTail: {
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 18,
    position: "absolute",
    zIndex: 1,
  },
  pikoStripe: {
    borderRadius: radii.pill,
    opacity: 0.48,
    position: "absolute",
    zIndex: 7,
  },
  arm: {
    borderRadius: radii.pill,
    position: "absolute",
    transformOrigin: "center top",
    zIndex: 5,
  },
  brow: {
    borderRadius: radii.pill,
    position: "absolute",
    zIndex: 8,
  },
  cheek: {
    borderRadius: radii.pill,
    opacity: 0.86,
    position: "absolute",
    zIndex: 8,
  },
  smile: {
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    position: "absolute",
    zIndex: 8,
  },
  neutralMouth: {
    borderRadius: radii.pill,
    position: "absolute",
    zIndex: 8,
  },
  openMouth: {
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "absolute",
    zIndex: 8,
  },
  foot: {
    borderRadius: radii.pill,
    position: "absolute",
    zIndex: 3,
  },
});
