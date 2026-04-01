import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Folders</Text>
        <TouchableOpacity onPress={() => setCreateVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={26} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {folders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No folders yet</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setCreateVisible(true)}>
            <Text style={styles.createBtnText}>Create Folder</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={f => f.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/folders/${item.id}`)}>
              <View style={[styles.colorBar, { backgroundColor: item.color }]} />
              <View style={styles.cardContent}>
                <Text style={styles.folderName}>{item.name}</Text>
                <Text style={styles.verseCount}>{item.verseIds.length} {item.verseIds.length === 1 ? "verse" : "verses"}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: "#f9f9f9", borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  backBtn: { padding: 4, marginRight: 8 },
  title: { flex: 1, fontSize: 22, fontWeight: "700" },
  addBtn: { padding: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 17, color: "#aaa", marginTop: 12, marginBottom: 20 },
  createBtn: { backgroundColor: "#007AFF", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  createBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  list: { padding: 16 },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f9f9f9", borderRadius: 12,
    marginBottom: 12, overflow: "hidden",
  },
  colorBar: { width: 6, alignSelf: "stretch" },
  cardContent: { flex: 1, padding: 16 },
  folderName: { fontSize: 16, fontWeight: "600", color: "#222" },
  verseCount: { fontSize: 13, color: "#888", marginTop: 2 },
  deleteBtn: { padding: 12 },
});
