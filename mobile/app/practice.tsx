import { useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ScrollView, Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { verseStorage, SavedVerse, progressStorage, VerseProgress } from "../utils/storage";
import { tokenize, validateFirstLetters, buildAnswer, getHiddenIndices } from "../utils/recallUtils";
import { usePreferences } from "../context/PreferencesContext";

type Phase = "select" | "practice" | "result";

const STAGE_LABELS: Record<number, string> = {
  1: "Stage 1 — Full Verse Visible",
  2: "Stage 2 — Partial Hidden",
  3: "Stage 3 — Full Recall",
};

const STAGE_COLORS: Record<number, string> = {
  1: "#007AFF",
  2: "#ff9500",
  3: "#af52de",
};

// ── Stage badge shown on verse select list ───────────────────────────────────

function StageBadge({ verseId, progressMap }: { verseId: string; progressMap: Record<string, VerseProgress> }) {
  const p = progressMap[verseId];
  if (!p) {
    return (
      <View className="px-2 py-0.5 rounded items-center justify-center bg-[#e8f0fe]">
        <Text className="text-xs font-bold text-[#007AFF]">S1</Text>
      </View>
    );
  }
  if (p.mastered) {
    return (
      <View className="px-2 py-0.5 rounded items-center justify-center bg-[#d4f5df]">
        <Ionicons name="checkmark-circle" size={14} color="#1a7a3a" />
      </View>
    );
  }
  const color = STAGE_COLORS[p.stage];
  return (
    <View className="px-2 py-0.5 rounded items-center justify-center" style={{ backgroundColor: color + "22" }}>
      <Text className="text-xs font-bold" style={{ color }}>S{p.stage}</Text>
    </View>
  );
}

// ── Stage 2: verse with hidden words ─────────────────────────────────────────

function PartialVerse({ text, verseId, style: textStyle }: { text: string; verseId: string; style?: object }) {
  const words = text.split(/\s+/);
  const tokens = tokenize(text);
  const hidden = getHiddenIndices(tokens, verseId);

  return (
    <Text style={textStyle}>
      {words.map((word, i) => {
        const cleanLen = Math.max(3, word.replace(/[^a-zA-Z0-9']/g, "").length);
        return hidden.has(i) ? (
          <Text key={i} className="text-[#aaa] italic">{"_".repeat(cleanLen)}{" "}</Text>
        ) : (
          <Text key={i}>{word}{" "}</Text>
        );
      })}
    </Text>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Practice() {
  const { prefs } = usePreferences();
  const [verses, setVerses] = useState<SavedVerse[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, VerseProgress>>({});
  const [phase, setPhase] = useState<Phase>("select");
  const [activeVerse, setActiveVerse] = useState<SavedVerse | null>(null);
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<boolean[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [stageAdvanced, setStageAdvanced] = useState(false);
  const [mastered, setMastered] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    const [vs, pm] = await Promise.all([
      verseStorage.getSavedVerses(),
      progressStorage.getAll(),
    ]);
    setVerses(vs);
    setProgressMap(pm);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const startPractice = async (verse: SavedVerse) => {
    const progress = await progressStorage.get(verse.id);
    setActiveVerse(verse);
    setActiveStage(progress?.stage ?? 1);
    setInput("");
    setResults([]);
    setAccuracy(0);
    setStageAdvanced(false);
    setMastered(false);
    setPhase("practice");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!activeVerse) return;
    const tokens = tokenize(activeVerse.text);
    const { results: res, accuracy: acc } = validateFirstLetters(tokens, input);
    setResults(res);
    setAccuracy(acc);

    const { advanced, mastered: isMastered, progress } = await progressStorage.recordAttempt(activeVerse.id, acc);
    setStageAdvanced(advanced);
    setMastered(isMastered);
    if (advanced) setActiveStage(progress.stage);

    if (acc < 1) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    setPhase("result");
    progressStorage.getAll().then(setProgressMap);
  };

  const reset = () => {
    setPhase("select");
    setActiveVerse(null);
    setInput("");
    loadData();
  };

  const retry = () => {
    setInput("");
    setPhase("practice");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Select phase ────────────────────────────────────────────────────────────

  if (phase === "select") {
    return (
      <View className="flex-1 bg-white">
        <View className="pt-16 px-5 pb-5 bg-[#f9f9f9] border-b border-[#eee]">
          <Text className="text-3xl font-bold mb-1">Practice</Text>
          <Text className="text-sm text-[#666]">Choose a verse to recall</Text>
        </View>
        {verses.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <Ionicons name="book-outline" size={48} color="#ccc" />
            <Text className="text-lg font-semibold text-[#999] mt-4">No saved verses yet</Text>
            <Text className="text-sm text-[#aaa] mt-2">Save verses from the Home tab first</Text>
          </View>
        ) : (
          <FlatList
            data={verses}
            keyExtractor={v => v.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center bg-[#f9f9f9] rounded-xl p-4 mb-3"
                onPress={() => startPractice(item)}
              >
                <View className="flex-1">
                  <Text className="text-base font-bold text-[#007AFF] mb-1">{item.reference}</Text>
                  {prefs.hideVerseText
                    ? <Text className="text-sm text-[#666] leading-[18px]" numberOfLines={2} />
                    : <Text className="text-sm text-[#666] leading-[18px]" numberOfLines={2}>{item.text}</Text>
                  }
                </View>
                <View className="flex-row items-center">
                  <StageBadge verseId={item.id} progressMap={progressMap} />
                  <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  // ── Practice phase ──────────────────────────────────────────────────────────

  if (phase === "practice" && activeVerse) {
    const tokens = tokenize(activeVerse.text);
    const stageColor = STAGE_COLORS[activeStage];

    return (
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <TouchableOpacity className="flex-row items-center mb-5 gap-1.5" onPress={reset}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text className="text-base text-[#007AFF]">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-extrabold text-[#111] mb-1">{activeVerse.reference}</Text>
        <Text
          className="text-xs mb-5 uppercase tracking-widest font-semibold"
          style={{ color: stageColor }}
        >
          {STAGE_LABELS[activeStage]}
        </Text>

        {/* Stage 1: full verse */}
        {activeStage === 1 && (
          <View
            className="bg-[#f0f6ff] rounded-xl p-4 mb-5 border-l-4"
            style={{ borderLeftColor: stageColor }}
          >
            {prefs.hideVerseText
              ? <Text className="text-base leading-6 text-[#aaa] italic">Text hidden — recall from memory</Text>
              : <Text className="text-base leading-6 text-[#222]">{activeVerse.text}</Text>
            }
          </View>
        )}

        {/* Stage 2: partial verse */}
        {activeStage === 2 && (
          <View
            className="bg-[#f0f6ff] rounded-xl p-4 mb-5 border-l-4"
            style={{ borderLeftColor: stageColor }}
          >
            {prefs.hideVerseText
              ? <Text className="text-base leading-6 text-[#aaa] italic">Text hidden — recall from memory</Text>
              : <>
                  <PartialVerse text={activeVerse.text} verseId={activeVerse.id} style={{ fontSize: 16, lineHeight: 26, color: "#222" }} />
                  <Text className="text-xs text-[#999] mt-2 italic">Visible words are memory hints</Text>
                </>
            }
          </View>
        )}

        {/* Stage 3: no verse shown */}
        {activeStage === 3 && (
          <View
            className="rounded-xl p-4 mb-5 border-l-4 bg-[#faf0ff]"
            style={{ borderLeftColor: stageColor }}
          >
            <Text className="text-base leading-6 text-[#aaa] italic">
              Verse hidden — recall from memory
            </Text>
          </View>
        )}

        <Text className="text-sm text-[#555] mb-1.5">
          Type the first letter of each word, separated by spaces:
        </Text>
        <Text className="text-xs text-[#999] mb-4 italic">{tokens.length} words · e.g. "{buildAnswer(tokens.slice(0, 3))} ..."</Text>

        <TextInput
          ref={inputRef}
          className="border border-[#ccc] rounded-xl p-3.5 text-lg mb-4 text-[#111]"
          style={{ borderWidth: 1.5, letterSpacing: 2, fontFamily: "monospace" }}
          value={input}
          onChangeText={setInput}
          placeholder="f g s l t w ..."
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          className={`rounded-xl p-4 items-center${!input.trim() ? " bg-[#ccc]" : ""}`}
          style={input.trim() ? { backgroundColor: stageColor } : undefined}
          onPress={handleSubmit}
          disabled={!input.trim()}
        >
          <Text className="text-white text-base font-bold">Check Answer</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Result phase ────────────────────────────────────────────────────────────

  if (phase === "result" && activeVerse) {
    const tokens = tokenize(activeVerse.text);
    const pct = Math.round(accuracy * 100);
    const grade = pct === 100 ? "Perfect!" : pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Keep Going" : "Try Again";
    const gradeColor = pct === 100 ? "#34c759" : pct >= 70 ? "#007AFF" : pct >= 50 ? "#ff9500" : "#ff3b30";
    const stageColor = STAGE_COLORS[activeStage];

    return (
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <TouchableOpacity className="flex-row items-center mb-5 gap-1.5" onPress={reset}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text className="text-base text-[#007AFF]">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-extrabold text-[#111] mb-1">{activeVerse.reference}</Text>

        {/* Stage advancement banner */}
        {mastered && (
          <View className="flex-row items-center gap-2 rounded-lg p-3 mb-3 bg-[#d4f5df]">
            <Ionicons name="checkmark-circle" size={20} color="#1a7a3a" />
            <Text className="text-base font-bold text-[#1a7a3a]">Mastered!</Text>
          </View>
        )}
        {stageAdvanced && !mastered && (
          <View
            className="flex-row items-center gap-2 rounded-lg p-3 mb-3"
            style={{ backgroundColor: stageColor + "22" }}
          >
            <Ionicons name="arrow-up-circle" size={20} color={stageColor} />
            <Text className="text-base font-bold" style={{ color: stageColor }}>
              Advanced to Stage {activeStage}!
            </Text>
          </View>
        )}

        <Animated.View
          className="items-center bg-[#f9f9f9] rounded-2xl p-7 my-5"
          style={{ transform: [{ translateX: shakeAnim }] }}
        >
          <Text className="text-2xl font-extrabold mb-1" style={{ color: gradeColor }}>{grade}</Text>
          <Text style={{ fontSize: 56, fontWeight: "900", lineHeight: 64, color: gradeColor }}>{pct}%</Text>
          <Text className="text-sm text-[#888] mt-1">
            {results.filter(Boolean).length} / {tokens.length} correct
          </Text>
        </Animated.View>

        <Text className="text-sm font-semibold text-[#555] mb-3 uppercase">Word by Word:</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {tokens.map((token, i) => (
            <View
              key={i}
              className={`px-2.5 py-1.5 rounded-lg${results[i] ? " bg-[#d4f5df]" : " bg-[#ffe0e0]"}`}
            >
              <Text className={`text-sm font-semibold${results[i] ? " text-[#1a7a3a]" : " text-[#c00]"}`}>
                {token}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 border rounded-xl p-3.5"
            style={{ borderWidth: 1.5, borderColor: "#007AFF" }}
            onPress={retry}
          >
            <Ionicons name="refresh" size={18} color="#007AFF" />
            <Text className="text-base font-semibold text-[#007AFF]">Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#007AFF] rounded-xl p-3.5 items-center"
            onPress={reset}
          >
            <Text className="text-white text-base font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
}
