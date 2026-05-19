import { useRef, useState } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";

interface Props {
  onVerse: () => void;
  onPassage: () => void;
  onFolder: () => void;
}

const RADIAL_OPTIONS = [
  { key: "verse",   label: "Verse",      icon: "book-outline"      as const, tx: 0,  ty: -95 },
  { key: "passage", label: "Passage",    icon: "documents-outline"  as const, tx: 67, ty: -67 },
  { key: "folders", label: "New Folder", icon: "folder-outline"     as const, tx: 95, ty: 0   },
] as const;

export default function RadialFAB({ onVerse, onPassage, onFolder }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(menuAnim, {
      toValue: open ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    setOpen(o => !o);
  };

  const handlePress = (key: string) => {
    toggle();
    if (key === "verse") onVerse();
    else if (key === "passage") onPassage();
    else if (key === "folders") onFolder();
  };

  return (
    <View className="absolute bottom-0 left-0" style={{ width: 230, height: 230, alignItems: "flex-start", justifyContent: "flex-end" }}>
      {RADIAL_OPTIONS.map((opt) => {
        const translateX = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, opt.tx] });
        const translateY = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, opt.ty] });
        const opacity = menuAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });
        const scale = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
        return (
          <Animated.View
            key={opt.key}
            className="absolute bottom-7 left-7 flex-row items-center gap-2"
            style={{ opacity, transform: [{ translateX }, { translateY }, { scale }] }}
          >
            <TouchableOpacity
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: theme.accent,
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
              }}
              onPress={() => handlePress(opt.key)}
            >
              <Ionicons name={opt.icon} size={20} color="#fff" />
            </TouchableOpacity>
            <Text
              className="text-xs font-semibold px-2 py-[3px] rounded-md"
              style={{ color: theme.text, backgroundColor: theme.surfaceElevated + "cc" }}
            >
              {opt.label}
            </Text>
          </Animated.View>
        );
      })}
      <TouchableOpacity
        className="absolute bottom-6 left-6 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: theme.accent,
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
        }}
        onPress={toggle}
      >
        <Animated.View style={{ transform: [{ rotate: menuAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] }) }] }}>
          <Ionicons name="add" size={28} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
