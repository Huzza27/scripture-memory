import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import { VerseProgress } from "../utils/storage";

interface StageBarProps {
  progress?: VerseProgress | null;
  isDue?: boolean;
}

export default function StageBar({ progress, isDue }: StageBarProps) {
  const theme = useTheme();

  if (!progress) {
    return (
      <View className="flex-row items-center gap-1" style={{ marginLeft: "auto" }}>
        {[1, 2, 3].map(i => (
          <View key={i} className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: theme.borderStrong }} />
        ))}
      </View>
    );
  }

  if (progress.mastered) {
    return (
      <View className="flex-row items-center gap-1" style={{ marginLeft: "auto" }}>
        <Ionicons name="trophy" size={13} color="#f5a623" />
        {isDue && <View className="w-[7px] h-[7px] rounded-full bg-[#ef4444] ml-[2px]" />}
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-1" style={{ marginLeft: "auto" }}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          className="w-[7px] h-[7px] rounded-full"
          style={{ backgroundColor: i <= progress.stage ? theme.accent : theme.borderStrong }}
        />
      ))}
      {isDue && <View className="w-[7px] h-[7px] rounded-full bg-[#ef4444] ml-[2px]" />}
    </View>
  );
}
