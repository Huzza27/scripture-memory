import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { useTheme } from "../utils/theme";

export default function SkeletonCard() {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity: pulse, backgroundColor: theme.surface, borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
        <View style={{ width: 90, height: 14, borderRadius: 6, backgroundColor: theme.border }} />
        <View style={{ width: 40, height: 10, borderRadius: 5, backgroundColor: theme.border, marginLeft: "auto" }} />
      </View>
      <View style={{ width: "90%", height: 10, borderRadius: 5, backgroundColor: theme.border, marginBottom: 6 }} />
      <View style={{ width: "60%", height: 10, borderRadius: 5, backgroundColor: theme.border }} />
    </Animated.View>
  );
}
