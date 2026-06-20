import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, TextInput, Vibration } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { folderStorage, verseStorage, Folder, SavedVerse } from "../../utils/storage";
import { getTranslationName } from "../../components/TranslationPicker";
import AddVerseModal from "../../components/AddVerseModal";
import { useDragContext } from "../../context/DragContext";
import { useTheme } from "../../utils/theme";
import { usePreferences } from "../../context/PreferencesContext";

export default function FolderDetail() {
  const theme = useTheme();
  const { prefs } = usePreferences();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setPendingDrag } = useDragContext();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [verses, setVerses] = useState<SavedVerse[]>([]);
  const [availableVerses, setAvailableVerses] = useState<SavedVerse[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [addNewVerseVisible, setAddNewVerseVisible] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [folders, allVerses] = await Promise.all([folderStorage.getFolders(), verseStorage.getSavedVerses()]);
    const found = folders.find(f => f.id === id);
    if (!found) return;
    setFolder(found);
    const inFolder = allVerses.filter(v => found.verseIds.includes(v.id));
    const notInFolder = allVerses.filter(v => !found.verseIds.includes(v.id));
    setVerses(inFolder);
    setAvailableVerses(notInFolder);
  }, [id]);

  useFocusEffect(load);

  const handleAddExisting = async (verseId: string) => {
    await folderStorage.addVerseToFolder(id, verseId);
    setSearch("");
    setPickerVisible(false);
    load();
  };

  const handleAddNew = async (reference: string, text: string, translation: string) => {
    setAddNewVerseVisible(false);
    try {
      await verseStorage.saveVerse({ reference, text, translation });
      const allVerses = await verseStorage.getSavedVerses();
      const saved = allVerses.find(v => v.reference === reference);
      if (saved) await folderStorage.addVerseToFolder(id, saved.id);
      load();
    } catch {
      Alert.alert("Error", "Could not save verse.");
    }
  };

  const handleRemoveVerse = (verse: SavedVerse) => {
    Alert.alert("Remove from Folder", `Remove "${verse.reference}" from this folder?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => { await folderStorage.removeVerseFromFolder(id, verse.id); load(); } },
    ]);
  };

  const filteredAvailable = search.trim()
    ? availableVerses.filter(v =>
        v.reference.toLowerCase().includes(search.toLowerCase()) ||
        v.text.toLowerCase().includes(search.toLowerCase())
      )
    : availableVerses;

  if (!folder) return null;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="flex-row items-center gap-2 pt-[60px] px-4 pb-4 border-b"
        style={{ backgroundColor: folder.color + "20", borderBottomColor: folder.color + "40" }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={22} color={folder.color} />
        </TouchableOpacity>
        <View className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: folder.color }} />
        <Text className="flex-1 text-xl font-bold" style={{ color: theme.text }}>{folder.name}</Text>
        <TouchableOpacity
          className="flex-row items-center gap-1.5 rounded-[10px] px-3 py-[7px]"
          style={{ backgroundColor: folder.color, opacity: verses.length === 0 ? 0.4 : 1 }}
          onPress={() => verses.length > 0 && router.push(`/flashcards/${id}`)}
        >
          <Ionicons name="layers-outline" size={16} color="#fff" />
          <Text className="text-white text-sm font-bold">Test</Text>
        </TouchableOpacity>
      </View>

      {verses.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: folder.color + "20" }}
          >
            <Ionicons name="book" size={36} color={folder.color} />
          </View>
          <Text className="text-[19px] font-bold text-center mb-2.5" style={{ color: theme.text }}>This folder is empty</Text>
          <Text className="text-sm text-center mb-7" style={{ color: theme.textTertiary, lineHeight: 21 }}>
            Add verses from your library or save a new one.
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-xl px-6 py-3.5"
            style={{ backgroundColor: folder.color }}
            onPress={() => setPickerVisible(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white text-base font-bold">Add a Verse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={v => v.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center rounded-xl p-4 mb-3"
              style={{ backgroundColor: theme.surface }}
              onPress={() => router.push(`/verse/${item.id}`)}
              onLongPress={() => {
                Vibration.vibrate(40);
                setPendingDrag(item, id as string);
                router.back();
              }}
              delayLongPress={500}
            >
              <View className="flex-1">
                <Text className="text-base font-bold mb-1" style={{ color: theme.accent }}>{item.reference}</Text>
                {prefs.hideVerseText
                  ? null
                  : <Text className="text-sm mb-1" style={{ color: theme.textSecondary, lineHeight: 18 }} numberOfLines={2}>{item.text}</Text>
                }
                <Text className="text-[11px] italic" style={{ color: theme.textMuted }}>{getTranslationName(item.translation)}</Text>
              </View>
              <TouchableOpacity
                className="p-1 mr-1.5"
                onPress={() => handleRemoveVerse(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="remove-circle-outline" size={20} color={theme.redText} />
              </TouchableOpacity>
              <Ionicons name="move-outline" size={16} color={theme.borderDisabled} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add verse FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
        style={{ backgroundColor: theme.accent, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}
        onPress={() => setPickerVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Verse picker sheet */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => { setPickerVisible(false); setSearch(""); }}>
        <TouchableOpacity
          className="absolute inset-0"
          style={{ backgroundColor: theme.overlayLight }}
          activeOpacity={1}
          onPress={() => { setPickerVisible(false); setSearch(""); }}
        />
        <View
          className="absolute bottom-0 left-0 right-0 rounded-t-[20px] p-6 pb-10"
          style={{ backgroundColor: theme.sheetBg, maxHeight: "70%" }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold" style={{ color: theme.text }}>Add Verse to Folder</Text>
            <TouchableOpacity onPress={() => { setPickerVisible(false); setSearch(""); }}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Add New Verse option */}
          <TouchableOpacity
            className="flex-row items-center gap-3 py-3"
            onPress={() => { setPickerVisible(false); setSearch(""); setAddNewVerseVisible(true); }}
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.accentSurfaceAlt }}
            >
              <Ionicons name="add" size={18} color={theme.accent} />
            </View>
            <Text className="flex-1 text-base font-semibold" style={{ color: theme.accent }}>Add New Verse</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.borderDisabled} />
          </TouchableOpacity>

          <View className="h-px my-3" style={{ backgroundColor: theme.border }} />

          {/* Search bar */}
          <View
            className="flex-row items-center gap-2 rounded-[10px] px-3 py-2 mb-3"
            style={{ backgroundColor: theme.surfaceMuted }}
          >
            <Ionicons name="search" size={16} color={theme.textTertiary} />
            <TextInput
              className="flex-1 text-sm"
              style={{ color: theme.text }}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by reference or book..."
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {filteredAvailable.length === 0 ? (
            <Text className="text-sm text-center py-5" style={{ color: theme.textTertiary }}>
              {availableVerses.length === 0
                ? "All saved verses are already in this folder."
                : "No verses match your search."}
            </Text>
          ) : (
            <FlatList
              data={filteredAvailable}
              keyExtractor={v => v.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center py-3.5 border-b"
                  style={{ borderBottomColor: theme.border }}
                  onPress={() => handleAddExisting(item.id)}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-semibold" style={{ color: theme.text }}>{item.reference}</Text>
                    {!prefs.hideVerseText && (
                      <Text className="text-xs mt-0.5" style={{ color: theme.textTertiary }} numberOfLines={1}>{item.text}</Text>
                    )}
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={theme.accent} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Add New Verse modal */}
      <AddVerseModal
        visible={addNewVerseVisible}
        onClose={() => setAddNewVerseVisible(false)}
        onVerseSelected={handleAddNew}
      />
    </View>
  );
}
