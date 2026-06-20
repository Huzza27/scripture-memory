import { View, Text, ViewStyle } from "react-native";
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
      className="pt-[20px] px-5 pb-5 border-b"
      style={[{ backgroundColor: theme.surface, borderBottomColor: theme.border }, style]}
    >
      <View className="items-center justify-between">
          <Text className="flex" style={[type.hero, { marginBottom: 4, color: theme.text }]}>{title}</Text>
          {subtitle ? <Text style={[type.body, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        </View>
        {rightAction ? <View className="ml-3">{rightAction}</View> : null}
    </View>
  );
}
