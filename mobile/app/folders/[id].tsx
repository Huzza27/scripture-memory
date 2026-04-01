import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { folderStorage, verseStorage, Folder, SavedVerse } from "../../utils/storage";
import { getTranslationName } from "../../components/TranslationPicker";

export default function FolderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [verses, setVerses] = useState<SavedVerse[]>([]);

  const load = useCallback(async () => {
    const [folders, allVerses] = await Promise.all([folderStorage.getFolders(), verseStorage.getSavedVerses()]);
    const found = folders.find(f => f.id === id);
    if (!found) return;
    setFolder(found);
    setVerses(allVerses.filter(v => found.verseIds.includes(v.id)));
  }, [id]);

  useFocusEffect(load);

  if (!folder) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#007AFF" />
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: folder.color }]} />
        <Text style={styles.title}>{folder.name}</Text>
        <Text style={styles.count}>{verses.length}</Text>
      </View>

      {verses.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No verses in this folder</Text>
          <Text style={styles.emptySubtext}>Open a verse and add it to this folder</Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={v => v.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/verse/${item.id}`)}>
              <View style={styles.cardContent}>
                <Text style={styles.reference}>{item.reference}</Text>
                <Text style={styles.preview} numberOfLines={2}>{item.text}</Text>
                <Text style={styles.translation}>{getTranslationName(item.translation)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: "#f9f9f9", borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  backBtn: { padding: 4 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  count: { fontSize: 14, color: "#888" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 17, color: "#999", marginTop: 12, fontWeight: "600" },
  emptySubtext: { fontSize: 13, color: "#aaa", marginTop: 6, textAlign: "center" },
  list: { padding: 16 },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f9f9f9", borderRadius: 12, padding: 16, marginBottom: 12,
  },
  cardContent: { flex: 1 },
  reference: { fontSize: 16, fontWeight: "700", color: "#007AFF", marginBottom: 4 },
  preview: { fontSize: 13, color: "#666", lineHeight: 18, marginBottom: 4 },
  translation: { fontSize: 11, color: "#999", fontStyle: "italic" },
});
