import type { TextStyle, ViewStyle } from "react-native";

export const palette = {
  cream: "#FBF7EE",
  creamStrong: "#F5EEDF",
  paper: "#FFFDF8",
  ink: "#243633",
  inkMuted: "#5D6D68",
  sky: "#CCE8F1",
  mint: "#BFE2D3",
  lavender: "#DCD3F4",
  peach: "#F5C6A9",
  sunshine: "#F4DDA0",
  teal: "#2F7F73",
  tealDark: "#235F57",
  white: "#FFFFFF",
  danger: "#A33B45",
} as const;

export const colors = {
  canvas: palette.cream,
  canvasRaised: palette.creamStrong,
  surface: palette.paper,
  surfaceMuted: "#F8F2E7",
  surfacePressed: "#EFE7D8",
  text: palette.ink,
  textMuted: palette.inkMuted,
  textSubtle: "#63736E",
  textInverse: palette.white,
  primary: palette.teal,
  primaryPressed: palette.tealDark,
  primarySoft: "#DCEEE7",
  primarySoftPressed: "#CEE4DB",
  border: "#D9DED7",
  borderStrong: "#AEBBB5",
  focusRing: "#176B91",
  error: palette.danger,
  errorSoft: "#F9E5E4",
  success: "#2F6B53",
  successSoft: "#E0F0E8",
  warning: "#8B641B",
  warningSoft: "#FAEDC7",
  info: "#336D82",
  infoSoft: "#DFEFF4",
  overlay: "rgba(36, 54, 51, 0.42)",
  disabledSurface: "#E8E6DF",
  disabledText: "#858C89",
  transparent: "transparent",
  companion: {
    mori: {
      base: "#84C7AD",
      deep: "#397C68",
      light: "#DFF3E8",
      accent: "#5EAA8E",
      cheek: "#E89B82",
    },
    lumi: {
      base: "#B9ACE7",
      deep: "#7565AD",
      light: "#EEEAFF",
      accent: "#9788D1",
      cheek: "#E891AA",
    },
    piko: {
      base: "#EFAD83",
      deep: "#A9573B",
      light: "#FFE8D9",
      accent: "#D9825E",
      cheek: "#D95F65",
    },
  },
} as const;

export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  jumbo: 56,
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  story: 36,
  pill: 999,
} as const;

export const layout = {
  minTouchTarget: 44,
  buttonHeight: 52,
  inputHeight: 54,
  screenPadding: 24,
  compactScreenPadding: 18,
  maxContentWidth: 680,
  maxReadingWidth: 560,
} as const;

export const typography = {
  display: {
    color: colors.text,
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1.25,
    lineHeight: 44,
  } satisfies TextStyle,
  screenTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 36,
  } satisfies TextStyle,
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.35,
    lineHeight: 28,
  } satisfies TextStyle,
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 23,
  } satisfies TextStyle,
  body: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  } satisfies TextStyle,
  bodySmall: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
  } satisfies TextStyle,
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.1,
    lineHeight: 22,
  } satisfies TextStyle,
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  } satisfies TextStyle,
} as const;

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: "#354E45",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  } satisfies ViewStyle,
  floating: {
    elevation: 5,
    shadowColor: "#354E45",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
  } satisfies ViewStyle,
} as const;

export const motion = {
  quick: 160,
  gentle: 420,
} as const;

export const theme = {
  colors,
  layout,
  motion,
  palette,
  radii,
  shadows,
  spacing,
  typography,
} as const;

export type AiyomiTheme = typeof theme;
