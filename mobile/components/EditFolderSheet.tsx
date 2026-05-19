import { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { useTheme } from "../utils/theme";
import { Folder, FOLDER_COLORS } from "../utils/storage";

interface Props {
  folder: Folder | null;
  onClose: () => void;
  onSave: (id: string, updates: { name: string; color: string }) => void;
}

export default function EditFolderSheet({ folder, onClose, onSave }: Props) {
  const theme = useTheme();

  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color);
    }
  }, [folder]);

  const handleSave = () => {
    if (!folder || !name.trim()) return;
    onSave(folder.id, { name: name.trim(), color });
  };

  return (
    <Modal visible={!!folder} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: theme.overlayLight }} activeOpacity={1} onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 rounded-t-[24px] p-6 pb-10" style={{ backgroundColor: theme.sheetBg }}>
        <View className="w-9 h-1 rounded-sm self-center mb-5" style={{ backgroundColor: theme.dragHandle }} />
        <Text className="text-lg font-bold mb-5" style={{ color: theme.text }}>Edit Folder</Text>

        <Text className="text-[13px] font-semibold uppercase tracking-[0.4px] mb-[6px]" style={{ color: theme.textTertiary }}>Name</Text>
        <TextInput
          className="border-[1.5px] rounded-xl p-3 text-[15px] mb-4"
          style={{ borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }}
          value={name}
          onChangeText={setName}
          placeholder="Folder name"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="words"
        />

        <Text className="text-[13px] font-semibold uppercase tracking-[0.4px] mb-[6px]" style={{ color: theme.textTertiary }}>Color</Text>
        <View className="flex-row gap-[10px] mb-6">
          {FOLDER_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              className="w-8 h-8 rounded-full"
              style={[{ backgroundColor: c }, color === c && { borderWidth: 3, borderColor: theme.text }]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <View className="flex-row gap-[10px]">
          <TouchableOpacity
            className="flex-1 border-[1.5px] rounded-xl p-[14px] items-center"
            style={{ borderColor: theme.borderStrong }}
            onPress={onClose}
          >
            <Text className="text-[15px] font-semibold" style={{ color: theme.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-xl p-[14px] items-center"
            style={{ backgroundColor: !name.trim() ? theme.borderDisabled : theme.accent }}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text className="text-white text-[15px] font-semibold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
