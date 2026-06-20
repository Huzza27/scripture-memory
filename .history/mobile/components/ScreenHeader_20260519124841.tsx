import { View, Text, ViewStyle, TouchableOpacity } from "react-native";
import { type } from "../utils/typography";
import { useTheme } from "../utils/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenHeader({ title, subtitle, rightAction, style }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View
      className="pt-[60px] px-5 pb-5 border-b"
      style={[{ backgroundColor: theme.surface, borderBottomColor: theme.border }, style]}
    >
      <View className="flex-row items-end justify-between">
        <TouchableOpacity>
          <View className="flex-1, rounded-full, bg-black, w-24, h-24">
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
