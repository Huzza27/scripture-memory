import { useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { verseStorage, SavedVerse } from "../utils/storage";
import { tokenize, validateFirstLetters, buildAnswer } from "../utils/recallUtils";

type Phase = "select" | "practice" | "result";

export default function Practice() {
  const [verses, setVerses] = useState<SavedVerse[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const [activeVerse, setActiveVerse] = useState<SavedVerse | null>(null);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<boolean[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      verseStorage.getSavedVerses().then(setVerses);
    }, [])
  );

  const startPractice = (verse: SavedVerse) => {
    setActiveVerse(verse);
    setInput("");
    setResults([]);
    setAccuracy(0);
    setPhase("practice");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    if (!activeVerse) return;
    const tokens = tokenize(activeVerse.text);
    const { results, accuracy } = validateFirstLetters(tokens, input);
    setResults(results);
    setAccuracy(accuracy);

    if (accuracy < 1) {
      // Shake animation on any wrong answers
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    setPhase("result");
  };

  const reset = () => {
    setPhase("select");
    setActiveVerse(null);
    setInput("");
  };

  const retry = () => {
    setInput("");
    setPhase("practice");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (phase === "select") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Text style={styles.subtitle}>Choose a verse to recall</Text>
        </View>
        {verses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No saved verses yet</Text>
            <Text style={styles.emptySubtext}>Save verses from the Home tab first</Text>
          </View>
        ) : (
          <FlatList
            data={verses}
            keyExtractor={v => v.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.verseCard} onPress={() => startPractice(item)}>
                <View style={styles.verseCardContent}>
                  <Text style={styles.reference}>{item.reference}</Text>
                  <Text style={styles.preview} numberOfLines={2}>{item.text}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  if (phase === "practice" && activeVerse) {
    const tokens = tokenize(activeVerse.text);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.practiceContainer}>
        <TouchableOpacity onPress={reset} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.practiceReference}>{activeVerse.reference}</Text>
        <Text style={styles.stageLabel}>Stage 1 — First Letter Recall</Text>

        <View style={styles.verseBox}>
          <Text style={styles.verseText}>{activeVerse.text}</Text>
        </View>

        <Text style={styles.instruction}>
          Type the first letter of each word, separated by spaces:
        </Text>
        <Text style={styles.wordCount}>{tokens.length} words · e.g. "{buildAnswer(tokens.slice(0, 3))} ..."</Text>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="f g s l t w ..."
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          style={[styles.submitBtn, !input.trim() && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim()}
        >
          <Text style={styles.submitBtnText}>Check Answer</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (phase === "result" && activeVerse) {
    const tokens = tokenize(activeVerse.text);
    const pct = Math.round(accuracy * 100);
    const grade = pct === 100 ? "Perfect!" : pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Keep Going" : "Try Again";
    const gradeColor = pct === 100 ? "#34c759" : pct >= 70 ? "#007AFF" : pct >= 50 ? "#ff9500" : "#ff3b30";

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.practiceContainer}>
        <TouchableOpacity onPress={reset} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.practiceReference}>{activeVerse.reference}</Text>

        <Animated.View style={[styles.scoreCard, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={[styles.scoreGrade, { color: gradeColor }]}>{grade}</Text>
          <Text style={[styles.scorePct, { color: gradeColor }]}>{pct}%</Text>
          <Text style={styles.scoreDetail}>
            {results.filter(Boolean).length} / {tokens.length} correct
          </Text>
        </Animated.View>

        <Text style={styles.sectionLabel}>Word by Word:</Text>
        <View style={styles.tokenGrid}>
          {tokens.map((token, i) => (
            <View
              key={i}
              style={[styles.tokenChip, results[i] ? styles.tokenCorrect : styles.tokenWrong]}
            >
              <Text style={[styles.tokenText, results[i] ? styles.tokenTextCorrect : styles.tokenTextWrong]}>
                {token}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.retryBtn} onPress={retry}>
            <Ionicons name="refresh" size={18} color="#007AFF" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={reset}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: "#f9f9f9", borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666" },
  list: { padding: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#999", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#aaa", marginTop: 8 },
  verseCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f9f9f9", borderRadius: 12,
    padding: 16, marginBottom: 12,
  },
  verseCardContent: { flex: 1 },
  reference: { fontSize: 16, fontWeight: "700", color: "#007AFF", marginBottom: 4 },
  preview: { fontSize: 13, color: "#666", lineHeight: 18 },

  practiceContainer: { padding: 20, paddingBottom: 60 },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 6 },
  backText: { color: "#007AFF", fontSize: 16 },
  practiceReference: { fontSize: 22, fontWeight: "800", color: "#111", marginBottom: 4 },
  stageLabel: { fontSize: 12, color: "#888", marginBottom: 20, textTransform: "uppercase", letterSpacing: 0.8 },
  verseBox: {
    backgroundColor: "#f0f6ff", borderRadius: 12,
    padding: 16, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: "#007AFF",
  },
  verseText: { fontSize: 16, lineHeight: 26, color: "#222" },
  instruction: { fontSize: 14, color: "#555", marginBottom: 6 },
  wordCount: { fontSize: 12, color: "#999", marginBottom: 16, fontStyle: "italic" },
  input: {
    borderWidth: 1.5, borderColor: "#ccc", borderRadius: 12,
    padding: 14, fontSize: 18, letterSpacing: 2,
    fontFamily: "monospace", marginBottom: 16, color: "#111",
  },
  submitBtn: {
    backgroundColor: "#007AFF", borderRadius: 12,
    padding: 16, alignItems: "center",
  },
  submitBtnDisabled: { backgroundColor: "#ccc" },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  scoreCard: {
    alignItems: "center", backgroundColor: "#f9f9f9",
    borderRadius: 16, padding: 28, marginVertical: 20,
  },
  scoreGrade: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  scorePct: { fontSize: 56, fontWeight: "900", lineHeight: 64 },
  scoreDetail: { fontSize: 14, color: "#888", marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 12, textTransform: "uppercase" },
  tokenGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 32 },
  tokenChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tokenCorrect: { backgroundColor: "#d4f5df" },
  tokenWrong: { backgroundColor: "#ffe0e0" },
  tokenText: { fontSize: 13, fontWeight: "600" },
  tokenTextCorrect: { color: "#1a7a3a" },
  tokenTextWrong: { color: "#c00" },
  resultActions: { flexDirection: "row", gap: 12 },
  retryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1.5, borderColor: "#007AFF",
    borderRadius: 12, padding: 14,
  },
  retryBtnText: { color: "#007AFF", fontSize: 15, fontWeight: "600" },
  doneBtn: {
    flex: 1, backgroundColor: "#007AFF",
    borderRadius: 12, padding: 14, alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
