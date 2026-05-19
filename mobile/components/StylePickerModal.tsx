import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const STYLES = [
  { key: "gentle worship", label: "Gentle Worship", icon: "heart-outline", description: "Soft, reverent, melodic" },
  { key: "hymn", label: "Hymn", description: "Traditional church hymn style", icon: "book-outline" },
  { key: "upbeat", label: "Upbeat", description: "Energetic, joyful, memorable", icon: "flash-outline" },
  { key: "chant", label: "Chant", description: "Rhythmic, repetitive, meditative", icon: "musical-note-outline" },
] as const;

export type SongStyle = typeof STYLES[number]["key"];

interface StylePickerModalProps {
  visible: boolean;
  onSelect: (style: SongStyle) => void;
  onClose: () => void;
}

export default function StylePickerModal({ visible, onSelect, onClose }: StylePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] p-6 pb-10">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-[17px] font-bold text-[#111]">Choose Song Style</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {STYLES.map((s) => (
          <TouchableOpacity key={s.key} className="flex-row items-center py-[14px] border-b border-[#f0f0f0]" onPress={() => onSelect(s.key)}>
            <View className="w-10 h-10 rounded-full bg-[#f0f6ff] items-center justify-center mr-[14px]">
              <Ionicons name={s.icon} size={22} color="#007AFF" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-[#222]">{s.label}</Text>
              <Text className="text-xs text-[#888] mt-[2px]">{s.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}
