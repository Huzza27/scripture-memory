import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { folderStorage, Folder } from "../utils/storage";
import CreateFolderModal from "../components/CreateFolderModal";

export default function Folders() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [createVisible, setCreateVisible] = useState(false);

  const load = async () => {
    const f = await folderStorage.getFolders();
    setFolders(f);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleCreate = async (name: string, color: string) => {
    setCreateVisible(false);
    await folderStorage.createFolder(name, color);
    load();
  };

  const handleDelete = (folder: Folder) => {
    Alert.alert("Delete Folder", `Delete "${folder.name}"? Verses inside will not be deleted.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await folderStorage.deleteFolder(folder.id); load(); } },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center pt-[60px] px-4 pb-4 bg-[#f9f9f9] border-b border-[#eee]">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
          <Ionicons name="arrow-back" size={22} color="#007AFF" />
        </TouchableOpacity>
        <Text className="flex-1 text-[22px] font-bold">Folders</Text>
        <TouchableOpacity onPress={() => setCreateVisible(true)} className="p-1">
          <Ionicons name="add" size={26} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {folders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="folder-outline" size={64} color="#ccc" />
          <Text className="text-lg mt-3 mb-5" style={{ color: "#aaa" }}>No folders yet</Text>
          <TouchableOpacity
            className="bg-[#007AFF] rounded-xl py-3 px-6"
            onPress={() => setCreateVisible(true)}
          >
            <Text className="text-white text-base font-semibold">Create Folder</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={f => f.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center bg-[#f9f9f9] rounded-xl mb-3 overflow-hidden"
              onPress={() => router.push(`/folders/${item.id}`)}
            >
              <View className="w-1.5 self-stretch" style={{ backgroundColor: item.color }} />
              <View className="flex-1 p-4">
                <Text className="text-base font-semibold" style={{ color: "#222" }}>{item.name}</Text>
                <Text className="text-sm mt-0.5" style={{ color: "#888" }}>
                  {item.verseIds.length} {item.verseIds.length === 1 ? "verse" : "verses"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                className="p-3"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color="#c00" />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}

      <CreateFolderModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreate={handleCreate}
      />
    </View>
  );
}
