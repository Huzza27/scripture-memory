import { useState, useCallback, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet, FlatList, Alert, Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { verseStorage, SavedVerse } from "../utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { getTranslationName } from "../components/TranslationPicker";
import AddVerseModal from "../components/AddVerseModal";
import { folderStorage } from "../utils/storage";

export default function Index() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookPickerVisible, setBookPickerVisible] = useState(false);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const radialOptions = [
    { key: "verse",   label: "Verse",   icon: "book-outline",     tx: 0,   ty: -95 },
    { key: "passage", label: "Passage", icon: "documents-outline", tx: -67, ty: -67 },
    { key: "folders", label: "Folders", icon: "folder-outline",    tx: -95, ty: 0   },
  ] as const;

  const toggleMenu = () => {
    Animated.spring(menuAnim, {
      toValue: menuOpen ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const handleRadialPress = (key: string) => {
    toggleMenu();
    if (key === "verse") setBookPickerVisible(true);
    else if (key === "passage") router.push("/search");
    else if (key === "folders") router.push("/folders");
  };

  const loadVerses = async () => {
    try {
      const verses = await verseStorage.getSavedVerses();
      setSavedVerses(verses);
    } catch (error) {
      console.error("Error loading verses:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadVerses(); }, []));

  const handleVerseSelected = async (reference: string, text: string, translation: string) => {
    setBookPickerVisible(false);
    try {
      await verseStorage.saveVerse({
        id: Date.now().toString(),
        reference,
        text,
        translation,
        savedAt: new Date().toISOString(),
      });
      loadVerses();
    } catch {
      Alert.alert("Error", "Could not save verse.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Verse", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => { await verseStorage.deleteVerse(id); await folderStorage.removeVerseFromAllFolders(id); loadVerses(); },
      },
    ]);
  };

  const renderVerse = ({ item }: { item: SavedVerse }) => (
    <TouchableOpacity style={styles.verseCard} onPress={() => router.push(`/verse/${item.id}`)}>
      <View style={styles.verseContent}>
        <View style={styles.verseTopRow}>
          <Text style={styles.reference}>{item.reference}</Text>
          <View style={styles.badges}>
            {item.songUri && (
              <View style={styles.badge}>
                <Ionicons name="musical-notes" size={11} color="#007AFF" />
              </View>
            )}
          </View>
        </View>
        <Text style={styles.verseText} numberOfLines={2}>{item.text}</Text>
        <Text style={styles.translation}>{getTranslationName(item.translation)}</Text>
      </View>
      <View style={styles.cardRight}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color="#c00" />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginTop: 8 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Verses</Text>
        <Text style={styles.subtitle}>{savedVerses.length}/10 saved</Text>
      </View>

      {savedVerses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No saved verses yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add a verse</Text>
        </View>
      ) : (
        <FlatList
          data={savedVerses}
          renderItem={renderVerse}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <AddVerseModal
        visible={bookPickerVisible}
        onClose={() => setBookPickerVisible(false)}
        onVerseSelected={handleVerseSelected}
      />

      <View style={styles.fabContainer}>
        {radialOptions.map((opt) => {
          const translateX = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, opt.tx] });
          const translateY = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, opt.ty] });
          const opacity = menuAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });
          const scale = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
          return (
            <Animated.View key={opt.key} style={[styles.subOptionWrapper, { opacity, transform: [{ translateX }, { translateY }, { scale }] }]}>
              <Text style={styles.subLabel}>{opt.label}</Text>
              <TouchableOpacity style={styles.subButton} onPress={() => handleRadialPress(opt.key)}>
                <Ionicons name={opt.icon} size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
        <TouchableOpacity style={styles.fab} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: menuAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] }) }] }}>
            <Ionicons name="add" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: "#f9f9f9", borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#999", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#aaa", textAlign: "center", marginTop: 8 },
  listContainer: { padding: 16 },
  verseCard: {
    backgroundColor: "#f9f9f9", borderRadius: 12, padding: 16,
    marginBottom: 12, flexDirection: "row", alignItems: "flex-start",
  },
  verseContent: { flex: 1 },
  verseTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  reference: { fontSize: 16, fontWeight: "bold", color: "#333" },
  badges: { flexDirection: "row", gap: 4 },
  badge: {
    backgroundColor: "#e8f0fe", borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  verseText: { fontSize: 14, lineHeight: 20, color: "#555", marginBottom: 6 },
  translation: { fontSize: 11, color: "#999", fontStyle: "italic" },
  cardRight: { alignItems: "center", marginLeft: 8 },
  deleteBtn: { padding: 4 },
  fabContainer: {
    position: "absolute", bottom: 0, right: 0,
    width: 230, height: 230, alignItems: "flex-end", justifyContent: "flex-end",
  },
  fab: {
    position: "absolute", bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28, backgroundColor: "#007AFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  subOptionWrapper: {
    position: "absolute", bottom: 28, right: 28,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  subButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#007AFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },
  subLabel: {
    fontSize: 12, fontWeight: "600", color: "#333",
    backgroundColor: "#ffffffcc", paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6,
  },
});
