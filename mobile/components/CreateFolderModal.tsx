import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { FOLDER_COLORS, FOLDER_COLOR_DEFAULT } from "../utils/storage";
import { useTheme } from "../utils/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

export default function CreateFolderModal({ visible, onClose, onCreate }: Props) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLOR_DEFAULT);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color);
    setName("");
    setColor(FOLDER_COLOR_DEFAULT);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: theme.overlay }} activeOpacity={1} onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 rounded-t-[20px] p-6 pb-10" style={{ backgroundColor: theme.sheetBg }}>
        <Text className="text-lg font-bold mb-4" style={{ color: theme.text }}>New Folder</Text>
        <TextInput
          className="border-[1.5px] rounded-xl p-3 text-base mb-5"
          style={{ borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }}
          value={name}
          onChangeText={setName}
          placeholder="Folder name"
          placeholderTextColor={theme.textTertiary}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />
        <Text className="text-[13px] font-semibold mb-[10px]" style={{ color: theme.textTertiary }}>Color</Text>
        <View className="flex-row gap-[10px] mb-6">
          {FOLDER_COLORS.map((c, i) => (
            <View key={c} className="items-center gap-1">
              <TouchableOpacity
                className="w-8 h-8 rounded-full"
                style={[{ backgroundColor: c }, color === c && { borderWidth: 3, borderColor: theme.text }]}
                onPress={() => setColor(c)}
              />
              {i === 0 && (
                <Text className="text-[9px] font-semibold uppercase tracking-[0.3px]" style={{ color: theme.textTertiary }}>Default</Text>
              )}
            </View>
          ))}
        </View>
        <View className="flex-row gap-[10px]">
          <TouchableOpacity
            className="flex-1 border-[1.5px] rounded-xl p-[14px] items-center"
            style={{ borderColor: theme.border }}
            onPress={onClose}
          >
            <Text className="text-[15px] font-semibold" style={{ color: theme.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-xl p-[14px] items-center"
            style={{ backgroundColor: !name.trim() ? theme.borderDisabled : theme.accent }}
            onPress={handleCreate}
            disabled={!name.trim()}
          >
            <Text className="text-white text-[15px] font-semibold">Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
