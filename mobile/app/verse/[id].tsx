import { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, TextInput, Animated, Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { verseStorage, progressStorage, folderStorage, SavedVerse, VerseProgress, Folder } from "../../utils/storage";
import { getTranslationName } from "../../components/TranslationPicker";
import SongPlayer from "../../components/SongPlayer";
import StylePickerModal, { SongStyle } from "../../components/StylePickerModal";
import FolderPickerModal from "../../components/FolderPickerModal";
import bibleApi from "../../api/bibleApi";
import { tokenize, getHiddenIndices } from "../../utils/recallUtils";

type Mode = "view" | "practice" | "result";
type WordStatus = null | "correct" | "wrong";

const STAGE_LABELS: Record<number, string> = {
  1: "Stage 1 — Full verse visible",
  2: "Stage 2 — Some words hidden",
  3: "Stage 3 — Verse hidden",
};

export default function VerseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [verse, setVerse] = useState<SavedVerse | null>(null);
  const [progress, setProgress] = useState<VerseProgress | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  const [generatingSong, setGeneratingSong] = useState(false);
  const [stylePickerVisible, setStylePickerVisible] = useState(false);
  const [folderPickerVisible, setFolderPickerVisible] = useState(false);
  const [verseFolders, setVerseFolders] = useState<Folder[]>([]);
  const [advancedToStage, setAdvancedToStage] = useState<number | null>(null);
  const [masteredModal, setMasteredModal] = useState(false);

  // Practice state
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputBuffer, setInputBuffer] = useState("");
  const inputRef = useRef<TextInput>(null);
  const flashAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Promise.all([
      verseStorage.getSavedVerses(),
      progressStorage.getAll(),
      id ? folderStorage.getFoldersForVerse(id) : Promise.resolve([]),
    ]).then(([verses, allProgress, folders]) => {
      const found = verses.find(v => v.id === id);
      if (found) setVerse(found);
      if (id && allProgress[id]) setProgress(allProgress[id]);
      setVerseFolders(folders);
    });
  }, [id]);

  const tokens = verse ? tokenize(verse.text) : [];
  const currentStage = progress?.stage ?? 1;
  const hiddenIndices = verse ? getHiddenIndices(tokens, verse.id) : new Set<number>();

  const startPractice = () => {
    setWordStatuses(new Array(tokens.length).fill(null));
    setCurrentIndex(0);
    setInputBuffer("");
    setMode("practice");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleInput = (text: string) => {
    if (!text || currentIndex >= tokens.length) {
      setInputBuffer("");
      return;
    }

    const char = text[text.length - 1].toLowerCase();
    const expected = tokens[currentIndex][0].toLowerCase();
    const isCorrect = char === expected;

    if (!isCorrect) {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.4, duration: 70, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      ]).start();
    }

    const next = currentIndex + 1;
    setWordStatuses(prev => {
      const updated = [...prev];
      updated[currentIndex] = isCorrect ? "correct" : "wrong";
      return updated;
    });
    setCurrentIndex(next);
    setInputBuffer("");

    if (next >= tokens.length) {
      finishPractice([...wordStatuses.slice(0, currentIndex), isCorrect ? "correct" : "wrong"]);
    }
  };

  const finishPractice = async (finalStatuses: WordStatus[]) => {
    if (!verse) return;
    const correctCount = finalStatuses.filter(s => s === "correct").length;
    const accuracy = correctCount / tokens.length;

    const { progress: newProgress, advanced, mastered } = await progressStorage.recordAttempt(verse.id, accuracy);
    setProgress(newProgress);
    setMode("result");

    if (mastered) {
      setMasteredModal(true);
    } else if (advanced) {
      setAdvancedToStage(newProgress.stage);
    }
  };

  const handleGenerateSong = async (style: SongStyle) => {
    if (!verse) return;
    setStylePickerVisible(false);
    setGeneratingSong(true);
    try {
      const songUri = await bibleApi.generateSong(verse.text, verse.reference, style);
      await verseStorage.updateVerse(verse.id, { songUri, songStyle: style });
      setVerse(prev => prev ? { ...prev, songUri, songStyle: style } : prev);
    } catch {
      Alert.alert("Generation Failed", "Could not generate song. Please try again.");
    } finally {
      setGeneratingSong(false);
    }
  };

  const dismissSong = async () => {
    if (!verse) return;
    await verseStorage.updateVerse(verse.id, { songUri: undefined, songStyle: undefined });
    setVerse(prev => prev ? { ...prev, songUri: undefined, songStyle: undefined } : prev);
  };

  const handleResetProgress = () => {
    Alert.alert("Reset Progress", "Reset this verse back to Stage 1?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset", style: "destructive",
        onPress: async () => {
          if (!verse) return;
          await progressStorage.reset(verse.id);
          setProgress(null);
          setAdvancedToStage(null);
        },
      },
    ]);
  };

  if (!verse) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const finalStatuses = wordStatuses;
  const correctCount = finalStatuses.filter(s => s === "correct").length;
  const accuracy = tokens.length > 0 ? correctCount / tokens.length : 0;
  const pct = Math.round(accuracy * 100);
  const grade = pct === 100 ? "Perfect!" : pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Keep Going" : "Try Again";
  const gradeColor = pct === 100 ? "#34c759" : pct >= 70 ? "#007AFF" : pct >= 50 ? "#ff9500" : "#ff3b30";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.translation}>{getTranslationName(verse.translation)}</Text>
      </View>

      <Text style={styles.reference}>{verse.reference}</Text>

      {/* Progress badge */}
      {mode === "view" && (
        <View style={styles.progressRow}>
          <View style={[styles.stageBadge, progress?.mastered && styles.stageBadgeMastered]}>
            {progress?.mastered
              ? <><Ionicons name="trophy" size={13} color="#fff" /><Text style={styles.stageBadgeText}>Mastered</Text></>
              : <Text style={styles.stageBadgeText}>Stage {currentStage} / 3</Text>
            }
          </View>
          {progress && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={13} color="#ff9500" />
              <Text style={styles.streakText}>{progress.streak} streak</Text>
            </View>
          )}
          {progress && (
            <TouchableOpacity onPress={handleResetProgress} style={styles.resetBtn}>
              <Ionicons name="refresh-outline" size={14} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Verse display (view mode) ── */}
      {mode === "view" && (
        <View style={styles.verseBox}>
          <Text style={styles.verseText}>{verse.text}</Text>
        </View>
      )}

      {/* ── Practice / Result display ── */}
      {(mode === "practice" || mode === "result") && (
        <>
          {mode === "practice" && (
            <Text style={styles.stageLabel}>{STAGE_LABELS[currentStage]}</Text>
          )}

          <Animated.View style={[styles.practiceVerseBox, { opacity: mode === "practice" ? flashAnim : 1 }]}>
            {/* Stage 3: only show reference */}
            {currentStage === 3 && mode === "practice" ? (
              <Text style={styles.stage3Hint}>"{verse.reference}" — type each first letter</Text>
            ) : (
              <View style={styles.wordFlow}>
                {tokens.map((token, i) => {
                  const status = wordStatuses[i];
                  const isCurrent = mode === "practice" && i === currentIndex;
                  const isHidden = currentStage === 2 && hiddenIndices.has(i) && status === null && !isCurrent;

                  return (
                    <Text
                      key={i}
                      style={[
                        styles.word,
                        isHidden && styles.wordHidden,
                        !isHidden && status === null && (isCurrent ? styles.wordCurrent : styles.wordGray),
                        status === "correct" && styles.wordCorrect,
                        status === "wrong" && styles.wordWrong,
                      ]}
                    >
                      {isHidden ? "░░░" : token}{" "}
                    </Text>
                  );
                })}
              </View>
            )}
          </Animated.View>

          {/* Hidden input */}
          {mode === "practice" && (
            <>
              <TextInput
                ref={inputRef}
                value={inputBuffer}
                onChangeText={handleInput}
                style={styles.hiddenInput}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                caretHidden
              />
              <TouchableOpacity style={styles.keyboardPrompt} onPress={() => inputRef.current?.focus()}>
                <Ionicons name="keypad-outline" size={16} color="#007AFF" />
                <Text style={styles.keyboardPromptText}>Tap here if keyboard closes</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Result */}
          {mode === "result" && (
            <>
              {advancedToStage && (
                <View style={styles.advanceBanner}>
                  <Ionicons name="arrow-up-circle" size={20} color="#34c759" />
                  <Text style={styles.advanceBannerText}>Advanced to Stage {advancedToStage}!</Text>
                </View>
              )}
              <View style={styles.scoreCard}>
                <Text style={[styles.scoreGrade, { color: gradeColor }]}>{grade}</Text>
                <Text style={[styles.scorePct, { color: gradeColor }]}>{pct}%</Text>
                <Text style={styles.scoreDetail}>{correctCount} / {tokens.length} words correct</Text>
                {progress && (
                  <Text style={styles.scoreStreak}>
                    {progress.streak >= 2 ? `🔥 ${progress.streak} in a row` : `${progress.streak} / 2 needed to advance`}
                  </Text>
                )}
              </View>
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.retryBtn} onPress={startPractice}>
                  <Ionicons name="refresh" size={16} color="#007AFF" />
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneBtn} onPress={() => { setMode("view"); setAdvancedToStage(null); }}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}

      {/* ── Practice Button ── */}
      {mode === "view" && (
        <TouchableOpacity style={styles.practiceBtn} onPress={startPractice}>
          <Ionicons name="fitness-outline" size={20} color="#fff" />
          <Text style={styles.practiceBtnText}>Practice — {STAGE_LABELS[currentStage]?.split("—")[0].trim()}</Text>
        </TouchableOpacity>
      )}

      {/* ── Folders Section ── */}
      {mode === "view" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Folders</Text>
          <View style={styles.folderChips}>
            {verseFolders.map(f => (
              <View key={f.id} style={[styles.folderChip, { borderColor: f.color }]}>
                <View style={[styles.chipDot, { backgroundColor: f.color }]} />
                <Text style={styles.chipText}>{f.name}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addFolderBtn} onPress={() => setFolderPickerVisible(true)}>
              <Ionicons name="folder-open-outline" size={14} color="#007AFF" />
              <Text style={styles.addFolderText}>{verseFolders.length > 0 ? "Edit" : "Add to Folder"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Song Section ── */}
      {mode === "view" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Song</Text>
          {verse.songUri ? (
            <>
              {verse.songStyle && <Text style={styles.songStyle}>{verse.songStyle}</Text>}
              <SongPlayer audioUri={verse.songUri} reference={verse.reference} onClose={dismissSong} />
              <TouchableOpacity style={styles.regenBtn} onPress={() => setStylePickerVisible(true)}>
                <Ionicons name="refresh" size={15} color="#007AFF" />
                <Text style={styles.regenBtnText}>Generate New</Text>
              </TouchableOpacity>
            </>
          ) : generatingSong ? (
            <View style={styles.generatingRow}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.generatingText}>Generating song (~12s)...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.generateBtn} onPress={() => setStylePickerVisible(true)}>
              <Ionicons name="musical-notes" size={20} color="#fff" />
              <Text style={styles.generateBtnText}>Generate Song</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Mastered modal */}
      <Modal visible={masteredModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🏆</Text>
            <Text style={styles.modalTitle}>Verse Mastered!</Text>
            <Text style={styles.modalBody}>You've completed all 3 stages for {verse.reference}. Well done!</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setMasteredModal(false)}>
              <Text style={styles.modalBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StylePickerModal
        visible={stylePickerVisible}
        onClose={() => setStylePickerVisible(false)}
        onSelect={handleGenerateSong}
      />

      {verse && (
        <FolderPickerModal
          visible={folderPickerVisible}
          verseId={verse.id}
          onClose={() => setFolderPickerVisible(false)}
          onChange={() => folderStorage.getFoldersForVerse(verse.id).then(setVerseFolders)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, paddingTop: 40,
  },
  backBtn: { padding: 4 },
  translation: { fontSize: 13, color: "#999", fontStyle: "italic" },
  reference: { fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 10 },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  stageBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#007AFF", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  stageBadgeMastered: { backgroundColor: "#34c759" },
  stageBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fff8ee", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: "#ffe0a0",
  },
  streakText: { color: "#ff9500", fontSize: 12, fontWeight: "600" },
  resetBtn: { marginLeft: "auto", padding: 4 },

  verseBox: {
    backgroundColor: "#f0f6ff", borderRadius: 12, padding: 16,
    borderLeftWidth: 4, borderLeftColor: "#007AFF", marginBottom: 20,
  },
  verseText: { fontSize: 17, lineHeight: 28, color: "#222" },

  stageLabel: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  practiceVerseBox: {
    backgroundColor: "#fafafa", borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: "#eee", marginBottom: 16,
  },
  wordFlow: { flexDirection: "row", flexWrap: "wrap" },
  word: { fontSize: 18, lineHeight: 30, fontWeight: "500" },
  wordGray: { color: "#c0c0c0" },
  wordHidden: { color: "#d8d8d8", letterSpacing: -1 },
  wordCurrent: { color: "#aaa", borderBottomWidth: 2, borderBottomColor: "#007AFF" },
  wordCorrect: { color: "#1a1a1a" },
  wordWrong: { color: "#e00" },
  stage3Hint: { fontSize: 16, color: "#888", fontStyle: "italic", textAlign: "center", padding: 12 },

  hiddenInput: { position: "absolute", opacity: 0, width: 1, height: 1 },
  keyboardPrompt: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "center", padding: 8, marginBottom: 8,
  },
  keyboardPromptText: { color: "#007AFF", fontSize: 13 },

  advanceBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#eafaf1", borderRadius: 10,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: "#b0e8c8",
  },
  advanceBannerText: { color: "#1a7a3a", fontSize: 14, fontWeight: "700" },

  scoreCard: {
    alignItems: "center", backgroundColor: "#f9f9f9",
    borderRadius: 16, padding: 24, marginBottom: 16,
  },
  scoreGrade: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  scorePct: { fontSize: 48, fontWeight: "900", lineHeight: 56 },
  scoreDetail: { fontSize: 13, color: "#888", marginTop: 4 },
  scoreStreak: { fontSize: 13, color: "#ff9500", marginTop: 6, fontWeight: "600" },

  resultActions: { flexDirection: "row", gap: 10, marginBottom: 24 },
  retryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1.5, borderColor: "#007AFF", borderRadius: 12, padding: 14,
  },
  retryBtnText: { color: "#007AFF", fontSize: 15, fontWeight: "600" },
  doneBtn: {
    flex: 1, backgroundColor: "#007AFF", borderRadius: 12,
    padding: 14, alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  practiceBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#34c759", borderRadius: 12,
    padding: 14, marginBottom: 28,
  },
  practiceBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: "#888",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12,
  },
  generateBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#007AFF", borderRadius: 12, padding: 14,
  },
  generateBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  generatingRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  generatingText: { color: "#666", fontSize: 14 },
  songStyle: { fontSize: 12, color: "#888", fontStyle: "italic", marginBottom: 6, textTransform: "capitalize" },
  regenBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, alignSelf: "flex-start" },
  regenBtnText: { color: "#007AFF", fontSize: 13 },
  folderChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  folderChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: "600", color: "#333" },
  addFolderBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1.5, borderColor: "#007AFF", borderRadius: 20, borderStyle: "dashed",
  },
  addFolderText: { fontSize: 13, color: "#007AFF", fontWeight: "600" },

  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center", padding: 32,
  },
  modalCard: {
    backgroundColor: "#fff", borderRadius: 20, padding: 32,
    alignItems: "center", width: "100%",
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#111", marginBottom: 8 },
  modalBody: { fontSize: 15, color: "#666", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  modalBtn: { backgroundColor: "#007AFF", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
