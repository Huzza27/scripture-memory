/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background:        "#f5f0e8",
        foreground:        "#1c1812",
        card:              "#ede8dc",
        primary:           "#2c1e0f",
        "primary-fg":      "#f5f0e8",
        secondary:         "#e2d9c8",
        muted:             "#d8cebc",
        "muted-fg":        "#6b5e48",
        accent:            "#7a3b1e",
        "accent-fg":       "#f5f0e8",
        border:            "rgba(44, 30, 15, 0.15)",
        translation_daily: "#d8cebc",
      },
    },
  },
  safelist: [
    { pattern: /^(p|px|py|pt|pb|pl|pr)-([6-9]|1[0-9]|2[0-4])$/ },
    { pattern: /^(m|mx|my|mt|mb|ml|mr)-([6-9]|1[0-9]|2[0-4])$/ },
    { pattern: /^(w|h|gap|space-x|space-y)-([6-9]|1[0-9]|2[0-4])$/ },
  ],
  plugins: [],
}

