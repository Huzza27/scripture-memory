import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Text, View, FlatList, Alert, Animated, TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { verseStorage, folderStorage, progressStorage, SavedVerse, Folder, VerseProgress } from "../utils/storage";
import { Ionicons } from "@expo/vector-icons";
import AddVerseModal from "../components/AddVerseModal";
import AddPassageModal from "../components/AddPassageModal";
import CreateFolderModal from "../components/CreateFolderModal";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme } from "../utils/theme";
import { useDragContext } from "../context/DragContext";
import { usePreferences } from "../context/PreferencesContext";
import { getScheduleLabel } from "../components/SchedulePickerModal";
import SkeletonCard from "../components/SkeletonCard";
import VerseCard from "../components/VerseCard";
import PracticeMenuSheet from "../components/PracticeMenuSheet";
import EditVerseSheet from "../components/EditVerseSheet";
import EditFolderSheet from "../components/EditFolderSheet";
import RadialFAB from "../components/RadialFAB";

export default function Index() {
  const theme = useTheme();
  const router = useRouter();
  const { pendingVerse, sourceFolderId, clearPendingDrag } = useDragContext();
  const { prefs } = usePreferences();

  // Data
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [allVerses, setAllVerses] = useState<SavedVerse[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allProgress, setAllProgress] = useState<Record<string, VerseProgress>>({});
  const [totalVerseCount, setTotalVerseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bookPickerVisible, setBookPickerVisible] = useState(false);
  const [passagePickerVisible, setPassagePickerVisible] = useState(false);
  const [createFolderVisible, setCreateFolderVisible] = useState(false);
  const [practiceMenuVerse, setPracticeMenuVerse] = useState<SavedVerse | null>(null);
  const [editVerseTarget, setEditVerseTarget] = useState<SavedVerse | null>(null);
  const [editFolderTarget, setEditFolderTarget] = useState<Folder | null>(null);

  // Drag state
  const [draggingVerse, setDraggingVerse] = useState<SavedVerse | null>(null);
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);
  const hoveredFolderRef = useRef<string | null>(null);
  const folderLayoutsRef = useRef<Record<string, { pageY: number; height: number }>>({});
  const folderViewRefs = useRef<Record<string, View | null>>({});
  const dragPosAnim = useRef(new Animated.ValueXY()).current;


  //Collapsable Menus
  const [dailyVersesMenu, setDailyVersesMenu] = useState(false);
  const dailyMenuAnim = useRef(new Animated.Value(0)).current;

  const toggleDailyMenu = () => {
    const toValue = dailyVersesMenu ? 0 : 500;
    Animated.timing(dailyMenuAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setDailyVersesMenu(!dailyVersesMenu);
  };

  const loadData = useCallback(async () => {
    try {
      const [verses, flds, progress] = await Promise.all([
        verseStorage.getSavedVerses(),
        folderStorage.getFolders(),
        progressStorage.getAll(),
      ]);
      const categorized = new Set(flds.flatMap(f => f.verseIds));
      setSavedVerses(verses.filter(v => !categorized.has(v.id)));
      setAllVerses(verses);
      setTotalVerseCount(verses.length);
      setFolders(flds);
      setAllProgress(progress);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const measureFolders = useCallback(() => {
    folderLayoutsRef.current = {};
    Object.entries(folderViewRefs.current).forEach(([folderId, ref]) => {
      ref?.measure((_x, _y, _w, h, _px, pageY) => {
        folderLayoutsRef.current[folderId] = { pageY, height: h };
      });
    });
  }, []);

  const updateHoveredFolder = useCallback((pageY: number) => {
    let hovered: string | null = null;
    for (const [folderId, layout] of Object.entries(folderLayoutsRef.current)) {
      if (pageY >= layout.pageY && pageY <= layout.pageY + layout.height) {
        hovered = folderId;
        break;
      }
    }
    if (hovered !== hoveredFolderRef.current) {
      hoveredFolderRef.current = hovered;
      setHoveredFolderId(hovered);
    }
  }, []);

  const handleDragStart = useCallback((item: SavedVerse, pageX: number, pageY: number) => {
    measureFolders();
    dragPosAnim.setValue({ x: pageX, y: pageY });
    setDraggingVerse(item);
  }, [measureFolders, dragPosAnim]);

  const handleDragMove = useCallback((pageX: number, pageY: number) => {
    dragPosAnim.setValue({ x: pageX, y: pageY });
    updateHoveredFolder(pageY);
  }, [dragPosAnim, updateHoveredFolder]);

  const handleDragEnd = useCallback(async (item: SavedVerse) => {
    const targetFolderId = hoveredFolderRef.current;
    hoveredFolderRef.current = null;
    setDraggingVerse(null);
    setHoveredFolderId(null);
    if (targetFolderId) {
      await folderStorage.addVerseToFolder(targetFolderId, item.id);
    }
    loadData();
  }, [loadData]);

  const handleDragCancel = useCallback(() => {
    hoveredFolderRef.current = null;
    setDraggingVerse(null);
    setHoveredFolderId(null);
  }, []);

  // ── Cross-screen move handlers ─────────────────────────────────────────────

  const handleFolderAssign = useCallback(async (targetFolderId: string) => {
    if (!pendingVerse || !sourceFolderId) return;
    if (targetFolderId === sourceFolderId) { clearPendingDrag(); return; }
    await folderStorage.removeVerseFromFolder(sourceFolderId, pendingVerse.id);
    await folderStorage.addVerseToFolder(targetFolderId, pendingVerse.id);
    clearPendingDrag();
    loadData();
  }, [pendingVerse, sourceFolderId, clearPendingDrag, loadData]);

  const handlePlaceAtRoot = useCallback(async () => {
    if (!pendingVerse || !sourceFolderId) return;
    await folderStorage.removeVerseFromFolder(sourceFolderId, pendingVerse.id);
    clearPendingDrag();
    loadData();
  }, [pendingVerse, sourceFolderId, clearPendingDrag, loadData]);

  // ── Verse/folder actions ───────────────────────────────────────────────────

  const handleVerseSelected = async (reference: string, text: string, translation: string) => {
    setBookPickerVisible(false);
    try {
      await verseStorage.saveVerse({ reference, text, translation });
      loadData();
    } catch {
      Alert.alert("Error", "Could not save verse.");
    }
  };

  const handlePassageSelected = async (reference: string, text: string, translation: string) => {
    setPassagePickerVisible(false);
    try {
      await verseStorage.saveVerse({ reference, text, translation });
      loadData();
    } catch {
      Alert.alert("Error", "Could not save passage.");
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    setCreateFolderVisible(false);
    await folderStorage.createFolder(name, color);
    loadData();
  };

  const handleDeleteVerse = (id: string) => {
    Alert.alert("Delete Verse", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await verseStorage.deleteVerse(id);
          await folderStorage.removeVerseFromAllFolders(id);
          loadData();
        },
      },
    ]);
  };

  const handleDeleteFolder = (folder: Folder) => {
    Alert.alert("Delete Folder", `Delete "${folder.name}"? Verses inside will not be deleted.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await folderStorage.deleteFolder(folder.id); loadData(); } },
    ]);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const todayDay = new Date().getDay();
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayVerses = allVerses.filter(v => v.schedule?.includes(todayDay));
  const isEmpty = savedVerses.length === 0 && folders.length === 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {pendingVerse && (
        <View
          className="absolute inset-0 z-0"
          style={{ backgroundColor: "rgba(0,122,255,0.05)" }}
          pointerEvents="none"
        />
      )}
      <ScreenHeader title="My Verses"/>

      {/* Cross-screen move mode banner */}
      {pendingVerse && (
        <View
          className="flex-col px-4 py-2.5 gap-2 border-b"
          style={{ backgroundColor: theme.accentSurface, borderBottomColor: theme.accent + "44" }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="move-outline" size={16} color="#007AFF" />
            <Text className="flex-1 text-sm font-semibold" style={{ color: theme.accent }} numberOfLines={1}>
              Moving "{pendingVerse.reference}" — tap a folder
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handlePlaceAtRoot}
              className="flex-1 rounded-lg py-2 items-center"
              style={{ backgroundColor: theme.accent }}
            >
              <Text className="text-white text-sm font-bold">Place at Root</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={clearPendingDrag}
              className="flex-1 border rounded-lg py-2 items-center"
              style={{ borderWidth: 1.5, borderColor: theme.accent + "44", backgroundColor: theme.surfaceElevated }}
            >
              <Text className="text-sm font-semibold" style={{ color: theme.accent }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View className="p-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : isEmpty ? (
        <View className="flex-1 justify-center items-center px-10">
          <View
            className="w-22 h-22 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: theme.accentSurfaceAlt }}
          >
            <Ionicons name="book" size={44} color="#007AFF" />
          </View>
          <Text className="text-xl font-bold text-center mb-2.5" style={{ color: theme.text }}>No verses saved yet</Text>
          <Text className="text-sm text-center mb-7" style={{ color: theme.textTertiary, lineHeight: 21 }}>
            Save Bible verses and practice memorizing them with guided rounds.
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-xl px-6 py-3.5"
            style={{ backgroundColor: theme.accent }}
            onPress={() => setBookPickerVisible(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white text-base font-bold">Add Your First Verse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedVerses}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <VerseCard
              item={item}
              progress={allProgress[item.id] ?? null}
              onTap={() => { if (!pendingVerse) setPracticeMenuVerse(item); }}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              isDragging={draggingVerse?.id === item.id}
            />
          )}
          ListHeaderComponent={
            (folders.length > 0 || todayVerses.length > 0) ? (
              <View>
                {/* ── Today section ── */}
                {todayVerses.length > 0 && (
               <View
                  className={`overflow-hidden ${
                    dailyVersesMenu ? "rounded-lg" : "rounded-t-lg"
                  }`}
                >
                  <TouchableOpacity onPress={toggleDailyMenu}>
                    <View className="flex-row items-center gap-1.5 h-7">
                      <Ionicons name="calendar" size={25} color={theme.accent} />
                      <Text
                        className="text-m font-bold uppercase"
                        style={{ color: theme.accent, letterSpacing: 0.6 }}
                        >
                        Daily Verses · {DAY_NAMES[todayDay]}
                        {dailyVersesMenu == true
                        }
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <Animated.View style={{ overflow: "hidden", maxHeight: dailyMenuAnim, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                    <View style={{ backgroundColor: theme.surface }}>
                      <View className="mt-1 mb-2 px-1.5">
                        {todayVerses.map(v => (
                          <TouchableOpacity
                            key={v.id}
                            className="flex-row items-center justify-between px-3.5 mb-0.5 mt-1 rounded-md"
                            style={{ backgroundColor: theme.accentSurface }}
                            onPress={() => router.push(`/verse/${v.id}?autostart=1`)}
                          >
                            <View className="flex-1 mr-3">
                              <Text className="text-base font-bold py-3" style={{ color: theme.text }}>{v.reference}</Text>
                              {!prefs.hideVerseText && (
                                <Text className="text-xs" style={{ color: theme.textTertiary, lineHeight: 17 }} numberOfLines={1}>{v.text}</Text>
                              )}
                            </View>
                            <View className="items-center gap-1">
                              <Ionicons name="play-circle" size={28} color={theme.accent} />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </Animated.View>
                    {(folders.length > 0 || savedVerses.length > 0) && (
                      <View className="h-px my-4" style={{ backgroundColor: theme.border }} />
                    )}
                  </View>
                )}

                {/* ── Folders ── */}
                {folders.length > 0 && (
                  <View>
                    <Text
                      className="text-xs font-semibold uppercase mb-2.5"
                      style={{ color: theme.textTertiary, letterSpacing: 0.5 }}
                    >
                      Folders
                    </Text>
                    {folders.map(folder => (
                      <View
                        key={folder.id}
                        ref={(ref) => { folderViewRefs.current[folder.id] = ref; }}
                      >
                        <TouchableOpacity
                          className="flex-row items-center rounded-xl mb-2 overflow-hidden"
                          style={[
                            {
                              backgroundColor: folder.color + theme.folderTint,
                              borderWidth: 1.5,
                              borderColor: hoveredFolderId === folder.id
                                ? theme.accent
                                : pendingVerse
                                  ? theme.accent + "44"
                                  : "transparent",
                            },
                            hoveredFolderId === folder.id && { backgroundColor: theme.accentSurface },
                            pendingVerse && !hoveredFolderId && { backgroundColor: theme.accentSurface },
                          ]}
                          onPress={() => {
                            if (pendingVerse) { handleFolderAssign(folder.id); return; }
                            if (!draggingVerse) router.push(`/folders/${folder.id}`);
                          }}
                          onLongPress={() => {
                            if (draggingVerse) return;
                            Alert.alert(folder.name, "What would you like to do?", [
                              { text: "Edit", onPress: () => setEditFolderTarget(folder) },
                              { text: "Delete", style: "destructive", onPress: () => handleDeleteFolder(folder) },
                              { text: "Cancel", style: "cancel" },
                            ]);
                          }}
                        >
                          <View className="w-[11px] self-stretch" style={{ backgroundColor: folder.color }} />
                          <View className="flex-1 py-3.5 px-3.5">
                            <Text className="text-base font-semibold" style={{ color: theme.text }}>{folder.name}</Text>
                            <Text className="text-xs mt-0.5" style={{ color: theme.textTertiary }}>
                              {folder.verseIds.length} {folder.verseIds.length === 1 ? "verse" : "verses"}
                            </Text>
                          </View>
                          {hoveredFolderId === folder.id ? (
                            <Ionicons name="add-circle" size={20} color={folder.color} style={{ marginRight: 12 }} />
                          ) : (
                            <Ionicons name="chevron-forward" size={16} color={theme.borderDisabled} />
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                    {savedVerses.length > 0 && (
                      <View className="h-px my-4" style={{ backgroundColor: theme.border }} />
                    )}
                  </View>
                )}
              </View>
            ) : null
          }
        />
      )}

      {/* Drag: floating ghost card */}
      {draggingVerse && (
        <Animated.View
          pointerEvents="none"
          className="absolute w-80 rounded-xl p-3.5"
          style={{
            backgroundColor: theme.surfaceElevated,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
            borderWidth: 1.5,
            borderColor: theme.accent + "33",
            transform: [
              { translateX: Animated.subtract(dragPosAnim.x, 160) },
              { translateY: Animated.subtract(dragPosAnim.y, 36) },
            ],
          }}
        >
          <Text className="text-base font-bold mb-1" style={{ color: theme.text }}>{draggingVerse.reference}</Text>
          {!prefs.hideVerseText && (
            <Text className="text-sm" style={{ color: theme.textSecondary }} numberOfLines={1}>{draggingVerse.text}</Text>
          )}
        </Animated.View>
      )}

      {/* Drag: instruction banner */}
      {draggingVerse && (
        <View
          pointerEvents="none"
          className="absolute bottom-24 left-5 right-5 flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl border"
          style={{ backgroundColor: theme.accentSurface, borderColor: theme.accent + "44" }}
        >
          <Ionicons name="arrow-up-outline" size={14} color="#007AFF" />
          <Text className="text-sm font-semibold" style={{ color: theme.accent }}>
            {hoveredFolderId
              ? `Drop to add to "${folders.find(f => f.id === hoveredFolderId)?.name}"`
              : "Drag to a folder to assign it"}
          </Text>
        </View>
      )}

      <PracticeMenuSheet
        verse={practiceMenuVerse}
        onClose={() => setPracticeMenuVerse(null)}
        onPractice={() => { const v = practiceMenuVerse; setPracticeMenuVerse(null); router.push(`/verse/${v!.id}?autostart=1`); }}
        onView={() => { const v = practiceMenuVerse; setPracticeMenuVerse(null); router.push(`/verse/${v!.id}`); }}
        onEdit={() => { setEditVerseTarget(practiceMenuVerse); setPracticeMenuVerse(null); }}
        onDelete={() => { const v = practiceMenuVerse; setPracticeMenuVerse(null); handleDeleteVerse(v!.id); }}
      />

      <EditVerseSheet
        verse={editVerseTarget}
        onClose={() => setEditVerseTarget(null)}
        onSave={async (id, updates) => {
          await verseStorage.updateVerse(id, updates);
          setEditVerseTarget(null);
          loadData();
        }}
      />

      <EditFolderSheet
        folder={editFolderTarget}
        onClose={() => setEditFolderTarget(null)}
        onSave={async (id, updates) => {
          await folderStorage.updateFolder(id, updates);
          setEditFolderTarget(null);
          loadData();
        }}
      />

      <AddVerseModal
        visible={bookPickerVisible}
        onClose={() => setBookPickerVisible(false)}
        onVerseSelected={handleVerseSelected}
      />

      <AddPassageModal
        visible={passagePickerVisible}
        onClose={() => setPassagePickerVisible(false)}
        onPassageSelected={handlePassageSelected}
      />

      <CreateFolderModal
        visible={createFolderVisible}
        onClose={() => setCreateFolderVisible(false)}
        onCreate={handleCreateFolder}
      />

      {!isEmpty && !loading && (
        <RadialFAB
          onVerse={() => setBookPickerVisible(true)}
          onPassage={() => setPassagePickerVisible(true)}
          onFolder={() => setCreateFolderVisible(true)}
        />
      )}
    </View>
  );
}
