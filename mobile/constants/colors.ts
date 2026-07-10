// COLOR PALETTE — constants/colors.ts
// Warm parchment theme used throughout the app.
// Import and use these instead of hardcoding hex values.
//
// Naming convention follows shadcn/Tailwind semantic roles:
//   background/foreground  — page background and default text
//   primary                — dark brown (headers, buttons)
//   secondary              — light tan (badges, subtle backgrounds)
//   muted / mutedForeground — de-emphasized text and surfaces
//   accent                 — deep terracotta red (CTAs, verse references)
//   border                 — subtle divider color
//
// These are also mapped to Tailwind class names in tailwind.config.js,
// so `className="bg-accent"` works the same as `style={{ backgroundColor: Colors.accent }}`.

export const Colors = {
  background:        "#f5f0e8", // Warm off-white parchment — page background
  foreground:        "#1c1812", // Near-black warm brown — default text
  card:              "#ede8dc", // Slightly darker than background — card surfaces
  primary:           "#2c1e0f", // Dark brown — TopBar, primary buttons
  primaryForeground: "#f5f0e8", // Text on primary-colored backgrounds
  secondary:         "#e2d9c8", // Light tan — translation badges, secondary surfaces
  muted:             "#d8cebc", // Muted surface color (also used as text-on-dark)
  mutedForeground:   "#6b5e48", // Medium brown — secondary text, timestamps, labels
  accent:            "#7a3b1e", // Deep terracotta red — CTAs, verse reference text
  accentForeground:  "#f5f0e8", // Text on accent-colored backgrounds
  border:            "rgba(44, 30, 15, 0.15)", // Subtle warm border
  translation_daily: "#d8cebc", // Translation badge color in the daily list
} as const;

export type ColorKey = keyof typeof Colors;
