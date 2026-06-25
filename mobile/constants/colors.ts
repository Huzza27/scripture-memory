export const Colors = {
  background:        "#f5f0e8",
  foreground:        "#1c1812",
  card:              "#ede8dc",
  primary:           "#2c1e0f",
  primaryForeground: "#f5f0e8",
  secondary:         "#e2d9c8",
  muted:             "#d8cebc",
  mutedForeground:   "#6b5e48",
  accent:            "#7a3b1e",
  accentForeground:  "#f5f0e8",
  border:            "rgba(44, 30, 15, 0.15)",
  translation_daily: "#d8cebc",
} as const;

export type ColorKey = keyof typeof Colors;
