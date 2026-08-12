export const colors = {
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

export const radii = {
  small: "0.75rem",
  medium: "1.25rem",
  large: "2.125rem",
  story: "2.625rem",
  pill: "9999px",
} as const;

export const shadows = {
  card: "0 12px 32px rgb(53 78 69 / 0.08)",
  floating: "0 24px 70px rgb(53 78 69 / 0.16)",
  story: "0 28px 90px rgb(49 77 68 / 0.13)",
} as const;

export const motion = {
  quick: "160ms",
  gentle: "420ms",
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const typography = {
  display: 'ui-rounded, "Avenir Next Rounded", "Arial Rounded MT Bold", sans-serif',
  feature: '"Avenir Next", "Segoe UI", ui-rounded, system-ui, sans-serif',
  body: '"Avenir Next", "Segoe UI", system-ui, sans-serif',
} as const;

export const designTokens = {
  colors,
  radii,
  shadows,
  motion,
  typography,
} as const;
