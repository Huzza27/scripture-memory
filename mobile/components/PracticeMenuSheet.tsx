import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import { usePreferences } from "../context/PreferencesContext";
import { SavedVerse } from "../utils/storage";

interface Props {
  verse: SavedVerse | null;
  onClose: () => void;
  onPractice: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PracticeMenuSheet({ verse, onClose, onPractice, onView, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const { prefs } = usePreferences();

  return (
    <Modal
      visible={!!verse}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: theme.overlayLight }} activeOpacity={1} onPress={onClose} />
      {verse && (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-[24px] p-6 pb-10" style={{ backgroundColor: theme.sheetBg }}>
          <View className="w-9 h-1 rounded-sm self-center mb-5" style={{ backgroundColor: theme.dragHandle }} />
          <Text className="text-xl font-black mb-[6px]" style={{ color: theme.text }}>{verse.reference}</Text>
          {prefs.hideVerseText
            ? <Text className="text-sm font-normal italic mb-6" style={{ color: theme.textMuted }}>Text hidden</Text>
            : <Text className="text-sm mb-6" style={{ color: theme.textTertiary, lineHeight: 20 }} numberOfLines={2}>{verse.text}</Text>
          }

          <TouchableOpacity
            className="flex-row items-center justify-center gap-[10px] rounded-[14px] p-4 mb-3"
            style={{ backgroundColor: theme.green }}
            onPress={onPractice}
          >
            <Ionicons name="fitness-outline" size={20} color="#fff" />
            <Text className="text-white text-base font-bold">Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-[10px] border-[1.5px] rounded-[14px] p-[14px] mb-[10px]"
            style={{ borderColor: theme.borderStrong }}
            onPress={onView}
          >
            <Ionicons name="book-outline" size={18} color="#007AFF" />
            <Text className="text-[15px] font-semibold" style={{ color: theme.accent }}>View Verse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-[10px] border-[1.5px] rounded-[14px] p-[14px] mb-[10px]"
            style={{ borderColor: theme.borderStrong }}
            onPress={onEdit}
          >
            <Ionicons name="pencil-outline" size={18} color="#007AFF" />
            <Text className="text-[15px] font-semibold" style={{ color: theme.accent }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-[10px] border-[1.5px] rounded-[14px] p-[14px] mb-[10px]"
            style={{ borderColor: theme.redText + "44" }}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color={theme.redText} />
            <Text className="text-[15px] font-semibold" style={{ color: theme.redText }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
}
