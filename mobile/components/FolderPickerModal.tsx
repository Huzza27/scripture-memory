import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { folderStorage, Folder } from "../utils/storage";

interface Props {
  visible: boolean;
  verseId: string;
  onClose: () => void;
  onChange: () => void;
}

export default function FolderPickerModal({ visible, verseId, onClose, onChange }: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;
    Promise.all([folderStorage.getFolders(), folderStorage.getFoldersForVerse(verseId)]).then(
      ([all, mine]) => {
        setFolders(all);
        setMemberIds(new Set(mine.map(f => f.id)));
      }
    );
  }, [visible, verseId]);

  const toggle = async (folderId: string) => {
    if (memberIds.has(folderId)) {
      await folderStorage.removeVerseFromFolder(folderId, verseId);
      setMemberIds(prev => { const n = new Set(prev); n.delete(folderId); return n; });
    } else {
      await folderStorage.addVerseToFolder(folderId, verseId);
      setMemberIds(prev => new Set([...prev, folderId]));
    }
    onChange();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] p-6 pb-10" style={{ maxHeight: "60%" }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[17px] font-bold">Add to Folder</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {folders.length === 0 ? (
          <Text className="text-[#aaa] text-sm text-center py-5">No folders yet. Create one from the home screen.</Text>
        ) : (
          <FlatList
            data={folders}
            keyExtractor={f => f.id}
            renderItem={({ item }) => (
              <TouchableOpacity className="flex-row items-center py-[14px] border-b border-[#f0f0f0]" onPress={() => toggle(item.id)}>
                <View className="w-[14px] h-[14px] rounded-full mr-3" style={{ backgroundColor: item.color }} />
                <Text className="flex-1 text-[15px] text-[#222]">{item.name}</Text>
                <Ionicons
                  name={memberIds.has(item.id) ? "checkbox" : "square-outline"}
                  size={22}
                  color={memberIds.has(item.id) ? "#007AFF" : "#ccc"}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
