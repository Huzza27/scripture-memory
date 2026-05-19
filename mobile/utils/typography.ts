import { TextStyle } from "react-native";

/**
 * App-wide typography scale.
 * Use these instead of hardcoded fontSize / fontWeight values.
 */
export const type: Record<string, TextStyle> = {
  hero:    { fontSize: 28, fontWeight: "700" },
  title:   { fontSize: 22, fontWeight: "700" },
  heading: { fontSize: 17, fontWeight: "700" },
  body:    { fontSize: 15, fontWeight: "400" },
  label:   { fontSize: 13, fontWeight: "600" },
  caption: { fontSize: 11, fontWeight: "600" },
};
