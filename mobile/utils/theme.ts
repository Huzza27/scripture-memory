import { useColorScheme } from "react-native";

export interface Theme {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;

  // Borders
  border: string;
  borderStrong: string;
  borderDisabled: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;

  // Accent (blue)
  accent: string;
  accentSurface: string;
  accentSurfaceAlt: string;
  accentText: string;

  // Semantic colors
  green: string;
  greenSurface: string;
  greenText: string;
  greenSurfaceAlt: string;

  red: string;
  redSurface: string;
  redText: string;

  orange: string;
  orangeSurface: string;

  // Misc
  overlay: string;
  overlayLight: string;
  dragHandle: string;
  sheetBg: string;

  // Tab bar
  tabBarBg: string;
  tabBarBorder: string;

  // Folder card tint opacity suffix (appended to hex color, e.g. "18")
  folderTint: string;
}

const light: Theme = {
  background:        "#fff",
  surface:           "#f9f9f9",
  surfaceElevated:   "#fff",
  surfaceMuted:      "#f4f4f4",

  border:            "#eee",
  borderStrong:      "#ddd",
  borderDisabled:    "#ccc",

  text:              "#111",
  textSecondary:     "#666",
  textTertiary:      "#888",
  textMuted:         "#bbb",

  accent:            "#007AFF",
  accentSurface:     "#f0f6ff",
  accentSurfaceAlt:  "#e8f0fe",
  accentText:        "#2255cc",

  green:             "#34c759",
  greenSurface:      "#d4f5df",
  greenText:         "#1a7a3a",
  greenSurfaceAlt:   "#eafaf1",

  red:               "#ff3b30",
  redSurface:        "#ffe0e0",
  redText:           "#c00",

  orange:            "#ff9500",
  orangeSurface:     "#fff8ee",

  overlay:           "rgba(0,0,0,0.5)",
  overlayLight:      "rgba(0,0,0,0.4)",
  dragHandle:        "#ddd",
  sheetBg:           "#fff",

  tabBarBg:          "#fff",
  tabBarBorder:      "#e8e8e8",
  folderTint:        "10",
};

const dark: Theme = {
  // Tailwind Slate palette — blue-grey toned, not flat black.
  // Used by Linear, GitHub dark, Vercel, shadcn/ui. Elegant and well-tested.

  background:        "#0f172a",  // slate-900
  surface:           "#1e293b",  // slate-800 — cards clearly lift from bg
  surfaceElevated:   "#293548",  // between slate-800/700 — modals, sheets
  surfaceMuted:      "#172033",  // slightly darker than surface — inputs, search bars

  border:            "#334155",  // slate-700 — card outlines, dividers
  borderStrong:      "#475569",  // slate-600 — input borders
  borderDisabled:    "#475569",  // slate-600 — disabled state

  text:              "#f1f5f9",  // slate-100 — primary text
  textSecondary:     "#94a3b8",  // slate-400 — secondary text
  textTertiary:      "#64748b",  // slate-500 — hints, labels
  textMuted:         "#475569",  // slate-600 — very dim text (translation labels etc.)

  accent:            "#3b82f6",  // blue-500 — vivid on slate bg, harmonises with blue undertone
  accentSurface:     "#1e3a5f",  // deep blue — reference check card etc.
  accentSurfaceAlt:  "#172d4a",  // darker blue — subtle tinted surfaces
  accentText:        "#93c5fd",  // blue-300 — blue text on dark bg

  green:             "#22c55e",  // green-500
  greenSurface:      "#052e16",  // green-950
  greenText:         "#86efac",  // green-300
  greenSurfaceAlt:   "#031810",  // darker green

  red:               "#ef4444",  // red-500
  redSurface:        "#450a0a",  // red-950
  redText:           "#fca5a5",  // red-300

  orange:            "#f59e0b",  // amber-500
  orangeSurface:     "#2d1a00",  // amber-dark

  overlay:           "rgba(0,0,0,0.8)",
  overlayLight:      "rgba(0,0,0,0.6)",
  dragHandle:        "#334155",  // slate-700
  sheetBg:           "#1e293b",  // slate-800

  tabBarBg:          "#0f172a",  // slate-900 — matches bg for seamless look
  tabBarBorder:      "#1e293b",  // slate-800
  folderTint:        "28",       // higher opacity so folder colors show on dark bg
};

export const useTheme = (): Theme =>
  useColorScheme() === "dark" ? dark : light;
