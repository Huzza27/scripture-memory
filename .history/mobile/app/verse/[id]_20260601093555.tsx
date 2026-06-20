import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, TextInput, Animated, Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { verseStorage, progressStorage, folderStorage, SavedVerse, VerseProgress, Folder } from "../../utils/storage";
import { getTranslationName } from "../../components/TranslationPicker";
import SongPlayer from "../../components/SongPlayer";
import StylePickerModal, { SongStyle } from "../../components/StylePickerModal";
import FolderPickerModal from "../../components/FolderPickerModal";
import SchedulePickerModal, { getScheduleLabel } from "../../components/SchedulePickerModal";
import bibleApi from "../../api/bibleApi";
import { tokenize, tokenizeRef, getHiddenIndices } from "../../utils/recallUtils";
import { useTheme } from "../../utils/theme";
import { usePreferences } from "../../context/PreferencesContext";

type Mode = "view" | "practice" | "result";
type WordStatus = null | "correct" | "wrong";

interface RoundResult {
  round: number;
  wordAccuracy: number;
}

const STAGE_LABELS: Record<number, string> = {
  1: "Stage 1 — Full verse visible",
  2: "Stage 2 — Some words hidden",
  3: "Stage 3 — Verse hidden",
};

export default function VerseDetail() {
  const theme = useTheme();
  const { prefs } = usePreferences();
  const { id, autostart } = useLocalSearchParams<{ id: string; autostart?: string }>();
  const router = useRouter();

  const [verse, setVerse] = useState<SavedVerse | null>(null);
  const [progress, setProgress] = useState<VerseProgress | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  const [generatingSong, setGeneratingSong] = useState(false);
  const [stylePickerVisible, setStylePickerVisible] = useState(false);
  const [folderPickerVisible, setFolderPickerVisible] = useState(false);
  const [schedulePickerVisible, setSchedulePickerVisible] = useState(false);
  const [verseFolders, setVerseFolders] = useState<Folder[]>([]);
  const [advancedToStage, setAdvancedToStage] = useState<number | null>(null);
  const [masteredModal, setMasteredModal] = useState(false);

  // Practice state
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputBuffer, setInputBuffer] = useState("");
  const inputRef = useRef<TextInput>(null);
  const flashAnim = useRef(new Animated.Value(1)).current;

  // 3-round session state
  const [sessionRound, setSessionRound] = useState<1 | 2 | 3>(1);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  useEffect(() => {
    Promise.all([
      verseStorage.getSavedVerses(),
      progressStorage.getAll(),
      id ? folderStorage.getFoldersForVerse(id) : Promise.resolve([]),
    ]).then(([verses, allProgress, folders]) => {
      const found = verses.find(v => v.id === id);
      if (found) {
        setVerse(found);
        if (autostart === "1") {
          setTimeout(() => {
            const toks = tokenize(found.text);
            const rToks = tokenizeRef(found.reference);
            setSessionRound(1);
            setRoundResults([]);
            setWordStatuses(new Array(toks.length + rToks.length).fill(null));
            setCurrentIndex(0);
            setInputBuffer("");
            setMode("practice");
            setTimeout(() => inputRef.current?.focus(), 150);
          }, 100);
        }
      }
      if (id && allProgress[id]) setProgress(allProgress[id]);
      setVerseFolders(folders);
    });
  }, [id]);

  const tokens = verse ? tokenize(verse.text) : [];
  const refTokens = verse ? tokenizeRef(verse.reference) : [];
  const allTokens = [...tokens, ...refTokens];
  const refStartIndex = tokens.length;
  const currentStage = progress?.stage ?? 1;
  const hiddenIndices = verse ? getHiddenIndices(tokens, verse.id) : new Set<number>();

  const startPractice = () => {
    setSessionRound(1);
    setRoundResults([]);
    setWordStatuses(new Array(allTokens.length).fill(null));
    setCurrentIndex(0);
    setInputBuffer("");
    setAdvancedToStage(null);
    setMode("practice");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const startRound = (round: 1 | 2 | 3) => {
    setSessionRound(round);
    setWordStatuses(new Array(allTokens.length).fill(null));
    setCurrentIndex(0);
    setInputBuffer("");
    setMode("practice");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleInput = (text: string) => {
    if (!text || currentIndex >= allTokens.length) {
      setInputBuffer("");
      return;
    }

    const char = text[text.length - 1].toLowerCase();
    const expected = allTokens[currentIndex][0].toLowerCase();
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

    if (next >= allTokens.length) {
      finishPractice([...wordStatuses.slice(0, currentIndex), isCorrect ? "correct" : "wrong"]);
    }
  };

  const finishPractice = async (finalStatuses: WordStatus[]) => {
    if (!verse) return;
    const correctCount = finalStatuses.filter(s => s === "correct").length;
    const accuracy = allTokens.length > 0 ? correctCount / allTokens.length : 0;
    const result: RoundResult = { round: sessionRound, wordAccuracy: accuracy };
    const newResults = [...roundResults, result];
    setRoundResults(newResults);

    if (sessionRound < 3) {
      startRound((sessionRound + 1) as 2 | 3);
    } else {
      const { progress: newProgress, advanced, mastered } = await progressStorage.recordAttempt(verse.id, accuracy);
      setProgress(newProgress);
      if (mastered) setMasteredModal(true);
      else if (advanced) setAdvancedToStage(newProgress.stage);
      setMode("result");
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

  const handleScheduleSave = async (newSchedule: number[]) => {
    if (!verse) return;
    await verseStorage.updateVerse(verse.id, { schedule: newSchedule });
    setVerse(prev => prev ? { ...prev, schedule: newSchedule } : prev);
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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }


  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5 pt-10">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={22} color={theme.accent} />
        </TouchableOpacity>
      </View>
      <View>
        
      </View>
      <Text className="font-extrabold mb-2.5" style={{ fontSize: 26, color: theme.text }}>{verse.reference}</Text>
      <Text className="text-sm italic" style={{ color: theme.textTertiary }}>{getTranslationName(verse.translation)}</Text>

      {/* ── Verse display (view mode) ── */}
      {mode === "view" && (
        <View
          className="rounded-xl p-4 mb-5 border-l-4"
          style={{ backgroundColor: theme.accentSurface, borderLeftColor: theme.accent }}
        >
          {prefs.hideVerseText
            ? <Text className="text-base italic text-center py-2" style={{ lineHeight: 24, color: theme.textMuted }}>Text hidden — practice to reveal</Text>
            : <Text style={{ fontSize: 17, lineHeight: 28, color: theme.text }}>{verse.text}</Text>
          }
        </View>
      )}

      {/* ── Practice display ── */}
      {mode === "practice" && (
        <>
          <Text
            className="text-xs uppercase mb-2.5"
            style={{ color: theme.textTertiary, letterSpacing: 0.6 }}
          >
            Round {sessionRound} / 3 — {STAGE_LABELS[sessionRound]?.split("—")[1]?.trim()}
          </Text>

          <Animated.View
            className="rounded-xl p-4 mb-4 border"
            style={{ opacity: flashAnim, backgroundColor: theme.surface, borderColor: theme.border }}
          >
            {sessionRound === 3 ? (
              <View>
                <Text className="text-base italic text-center p-3" style={{ color: theme.textTertiary }}>
                  Verse hidden — type each first letter, then the reference
                </Text>
                <View className="flex-row flex-wrap mt-3">
                  {refTokens.map((token, j) => {
                    const i = refStartIndex + j;
                    const status = wordStatuses[i];
                    const isCurrent = i === currentIndex;
                    return (
                      <Text
                        key={i}
                        style={[
                          { fontSize: 18, lineHeight: 30, fontWeight: "500" },
                          status === null && (isCurrent
                            ? { color: theme.textTertiary, borderBottomWidth: 2, borderBottomColor: theme.accent }
                            : { color: theme.textTertiary, fontStyle: "italic" }),
                          status === "correct" && { color: theme.text },
                          status === "wrong" && { color: theme.red },
                        ]}
                      >
                        {"░".repeat(Math.min(token.length, 3))}{" "}
                      </Text>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View className="flex-row flex-wrap">
                {allTokens.map((token, i) => {
                  const status = wordStatuses[i];
                  const isCurrent = i === currentIndex;
                  const isRef = i >= refStartIndex;
                  const isHidden = !isRef && sessionRound === 2 && hiddenIndices.has(i) && status === null && !isCurrent;
                  return (
                    <Fragment key={i}>
                      {isRef && i === refStartIndex && (
                        <Text style={{ fontSize: 18, color: theme.textMuted, lineHeight: 30 }}> — </Text>
                      )}
                      <Text
                        style={[
                          { fontSize: 18, lineHeight: 30, fontWeight: "500" },
                          isHidden && { color: theme.border, letterSpacing: -1 },
                          !isHidden && status === null && (isCurrent
                            ? { color: theme.textTertiary, borderBottomWidth: 2, borderBottomColor: theme.accent }
                            : isRef
                              ? { color: theme.textTertiary, fontStyle: "italic" }
                              : { color: theme.textMuted }),
                          status === "correct" && { color: theme.text },
                          status === "wrong" && { color: theme.red },
                        ]}
                      >
                        {isHidden ? "░░░" : token}{" "}
                      </Text>
                    </Fragment>
                  );
                })}
              </View>
            )}
          </Animated.View>

          <TextInput
            ref={inputRef}
            value={inputBuffer}
            onChangeText={handleInput}
            className="absolute opacity-0 w-px h-px"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            caretHidden
          />
          <TouchableOpacity
            className="flex-row items-center gap-1.5 self-center p-2 mb-2"
            onPress={() => inputRef.current?.focus()}
          >
            <Ionicons name="keypad-outline" size={16} color={theme.accent} />
            <Text className="text-sm" style={{ color: theme.accent }}>Tap here if keyboard closes</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── Result ── */}
      {mode === "result" && (
        <>
          {advancedToStage && (
            <View
              className="flex-row items-center gap-2 rounded-[10px] p-3 mb-3 border"
              style={{ backgroundColor: theme.greenSurfaceAlt, borderColor: theme.green + "44" }}
            >
              <Ionicons name="arrow-up-circle" size={20} color={theme.green} />
              <Text className="text-sm font-bold" style={{ color: theme.greenText }}>Advanced to Stage {advancedToStage}!</Text>
            </View>
          )}
          <Text className="text-xl font-extrabold mb-4" style={{ color: theme.text }}>Session Complete</Text>
          {roundResults.map(r => {
            const wPct = Math.round(r.wordAccuracy * 100);
            const wColor = wPct === 100 ? theme.green : wPct >= 70 ? theme.accent : theme.orange;
            return (
              <View
                key={r.round}
                className="flex-row items-center justify-between rounded-xl p-3.5 mb-2.5"
                style={{ backgroundColor: theme.surface }}
              >
                <View className="flex-1">
                  <Text className="text-base font-bold" style={{ color: theme.text }}>Round {r.round}</Text>
                  <Text className="text-xs mt-0.5" style={{ color: theme.textTertiary }}>{STAGE_LABELS[r.round]?.split("—")[1]?.trim()}</Text>
                </View>
                <Text className="text-xl font-extrabold" style={{ color: wColor }}>{wPct}%</Text>
              </View>
            );
          })}
          {progress && (
            <Text className="text-sm font-semibold mt-1 mb-4" style={{ color: theme.orange }}>
              {progress.streak >= 2 ? `🔥 ${progress.streak} in a row` : `${progress.streak} / 2 needed to advance`}
            </Text>
          )}
          <View className="flex-row gap-2.5 mb-6">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl p-3.5"
              style={{ borderWidth: 1.5, borderColor: theme.accent }}
              onPress={startPractice}
            >
              <Ionicons name="refresh" size={16} color={theme.accent} />
              <Text className="text-base font-semibold" style={{ color: theme.accent }}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl p-3.5 items-center"
              style={{ backgroundColor: theme.accent }}
              onPress={() => setMode("view")}
            >
              <Text className="text-white text-base font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Practice Button ── */}
      {mode === "view" && (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2.5 rounded-xl p-3.5 mb-7"
          style={{ backgroundColor: theme.green }}
          onPress={startPractice}
        >
          <Text className="text-white text-base font-semibold">Practice </Text>
        </TouchableOpacity>
      )}

      {/* ── Folders Section ── */}
      {mode === "view" && <View className="h-px mb-7" style={{ backgroundColor: theme.border }} />}
      {mode === "view" && (
        <View className="mb-7">
          <Text
            className="text-xs font-bold uppercase mb-3"
            style={{ color: theme.textTertiary, letterSpacing: 0.8 }}
          >
            Folders
          </Text>
          <View className="flex-row flex-wrap gap-2 items-center">
            {verseFolders.map(f => (
              <View
                key={f.id}
                className="flex-row items-center gap-1.5 rounded-full px-2.5 py-[5px]"
                style={{ borderWidth: 1.5, borderColor: f.color }}
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                <Text className="text-sm font-semibold" style={{ color: theme.text }}>{f.name}</Text>
              </View>
            ))}
            <TouchableOpacity
              className="flex-row items-center gap-[5px] px-2.5 py-[5px] rounded-full"
              style={{ borderWidth: 1.5, borderColor: theme.accent, borderStyle: "dashed" }}
              onPress={() => setFolderPickerVisible(true)}
            >
              <Ionicons name="folder-open-outline" size={14} color={theme.accent} />
              <Text className="text-sm font-semibold" style={{ color: theme.accent }}>
                {verseFolders.length > 0 ? "Edit" : "Add to Folder"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Schedule Section ── */}
      {mode === "view" && <View className="h-px mb-7" style={{ backgroundColor: theme.border }} />}
      {mode === "view" && (
        <View className="mb-7">
          <Text
            className="text-xs font-bold uppercase mb-3"
            style={{ color: theme.textTertiary, letterSpacing: 0.8 }}
          >
            Schedule
          </Text>
          <View
            className="flex-row items-center justify-between rounded-xl p-3.5 border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={verse.schedule?.length ? "calendar" : "calendar-outline"}
                size={16}
                color={verse.schedule?.length ? theme.accent : theme.textTertiary}
              />
              <Text
                className="text-sm font-medium"
                style={{ color: verse.schedule?.length ? theme.text : theme.textTertiary }}
              >
                {getScheduleLabel(verse.schedule)}
              </Text>
            </View>
            <TouchableOpacity
              className="px-3 py-[5px] rounded-lg"
              style={{ borderWidth: 1.5, borderColor: theme.accent }}
              onPress={() => setSchedulePickerVisible(true)}
            >
              <Text className="text-sm font-semibold" style={{ color: theme.accent }}>
                {verse.schedule?.length ? "Edit" : "Set Schedule"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Song Section ── */}
      {mode === "view" && <View className="h-px mb-7" style={{ backgroundColor: theme.border }} />}
      {mode === "view" && (
        <View className="mb-7">
          <Text
            className="text-xs font-bold uppercase mb-3"
            style={{ color: theme.textTertiary, letterSpacing: 0.8 }}
          >
            Song
          </Text>
          <View className="flex-row items-center gap-2 py-3">
            <Ionicons name="musical-notes-outline" size={18} color={theme.textTertiary} />
            <Text className="text-sm italic" style={{ color: theme.textTertiary }}>Coming soon</Text>
          </View>
        </View>
      )}

      {/* Mastered modal */}
      <Modal visible={masteredModal} transparent animationType="fade">
        <View
          className="flex-1 items-center justify-center p-8"
          style={{ backgroundColor: theme.overlay }}
        >
          <View
            className="rounded-[20px] p-8 items-center w-full"
            style={{ backgroundColor: theme.surfaceElevated }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏆</Text>
            <Text className="text-[22px] font-extrabold mb-2" style={{ color: theme.text }}>Verse Mastered!</Text>
            <Text
              className="text-base text-center mb-6"
              style={{ color: theme.textSecondary, lineHeight: 22 }}
            >
              You've completed all 3 stages for {verse.reference}. Well done!
            </Text>
            <TouchableOpacity
              className="rounded-xl py-3.5 px-8"
              style={{ backgroundColor: theme.accent }}
              onPress={() => setMasteredModal(false)}
            >
              <Text className="text-white text-base font-bold">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StylePickerModal
        visible={stylePickerVisible}
        onClose={() => setStylePickerVisible(false)}
        onSelect={handleGenerateSong}
      />

      <SchedulePickerModal
        visible={schedulePickerVisible}
        schedule={verse.schedule}
        onClose={() => setSchedulePickerVisible(false)}
        onSave={handleScheduleSave}
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
