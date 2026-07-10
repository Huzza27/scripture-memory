// DAILY MENU STYLES — components/DailyMenu/DailyMenu.styles.ts
// StyleSheet for DailyMenu.tsx and DailyVerseCard.tsx.
// Used for styles that can't be expressed cleanly in Tailwind/NativeWind,
// such as partial borders (borderTopWidth: 0) and radius on specific corners.

import { StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sessionButton: {
    width: "100%",
    backgroundColor: Colors.accent,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  sessionRow: {
    flexDirection: "row",
  },
  sessionIcon: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sessionText: {
    flexDirection: "column",
  },
  sessionLabel: {
    fontSize: 11,
    paddingTop: 12,
    fontWeight: "300",
    color: Colors.muted,
    letterSpacing: 2,
  },
  sessionSubLabel: {
    paddingBottom: 12,
    color: Colors.muted,
  },
  sessionArrow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  expandedPanel: {
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderColor: Colors.border,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  panelInner: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  practiceItem: {
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderColor: Colors.border,
  },
  practiceButtonText: {
    color: Colors.primaryForeground,
    paddingVertical: 4,
  },
});
