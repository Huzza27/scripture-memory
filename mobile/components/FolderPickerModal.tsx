import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from "react-native";
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
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Add to Folder</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {folders.length === 0 ? (
          <Text style={styles.empty}>No folders yet. Create one from the home screen.</Text>
        ) : (
          <FlatList
            data={folders}
            keyExtractor={f => f.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => toggle(item.id)}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.folderName}>{item.name}</Text>
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

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40, maxHeight: "60%",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 17, fontWeight: "700" },
  empty: { color: "#aaa", fontSize: 14, textAlign: "center", paddingVertical: 20 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  folderName: { flex: 1, fontSize: 15, color: "#222" },
});
