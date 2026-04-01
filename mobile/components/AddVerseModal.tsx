import { useState } from "react";
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OT_BOOKS, NT_BOOKS, BibleBook, getVerseCount } from "../utils/bibleData";
import bibleApi from "../api/bibleApi";

type Step = "book" | "chapter" | "verse";

interface Props {
  visible: boolean;
  onClose: () => void;
  onVerseSelected: (reference: string, text: string, translation: string) => void;
  translation?: string;
}

export default function AddVerseModal({ visible, onClose, onVerseSelected, translation = "kjv" }: Props) {
  const [step, setStep] = useState<Step>("book");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingVerse, setPendingVerse] = useState<number | null>(null);

  const reset = () => {
    setStep("book");
    setSelectedBook(null);
    setSelectedChapter(null);
    setSaving(false);
    setSaveError(null);
    setPendingVerse(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setStep("chapter");
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setSaveError(null);
    setStep("verse");
  };

  const handleSelectVerse = async (verseNum: number) => {
    if (!selectedBook || !selectedChapter || saving) return;
    const reference = `${selectedBook.full} ${selectedChapter}:${verseNum}`;
    setSaving(true);
    setSaveError(null);
    setPendingVerse(verseNum);
    try {
      const resp = await bibleApi.getVerse(reference, translation);
      if (resp.success && resp.data) {
        onVerseSelected(reference, resp.data.text.trim(), translation);
        reset();
      } else {
        setSaveError("Verse not found. Try another.");
        setSaving(false);
        setPendingVerse(null);
      }
    } catch {
      setSaveError("Network error. Check your connection.");
      setSaving(false);
      setPendingVerse(null);
    }
  };

  const goBack = () => {
    if (step === "chapter") {
      setStep("book");
      setSelectedBook(null);
    } else if (step === "verse") {
      setStep("chapter");
      setSelectedChapter(null);
      setSaveError(null);
    }
  };

  const stepTitle =
    step === "book"    ? "Select Book" :
    step === "chapter" ? (selectedBook?.full ?? "Select Chapter") :
                         `${selectedBook?.abbr} ${selectedChapter}`;

  const verseCount = selectedBook && selectedChapter
    ? getVerseCount(selectedBook.full, selectedChapter)
    : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheet}>
          <SafeAreaView style={styles.inner}>

            <View style={styles.header}>
              <TouchableOpacity
                onPress={step === "book" ? handleClose : goBack}
                style={styles.headerBtn}
                disabled={saving}
              >
                <Ionicons
                  name={step === "book" ? "close" : "chevron-back"}
                  size={22}
                  color={saving ? "#ccc" : step === "book" ? "#555" : "#007AFF"}
                />
              </TouchableOpacity>
              <Text style={styles.title} numberOfLines={1}>{stepTitle}</Text>
              {step !== "book" ? (
                <TouchableOpacity onPress={handleClose} style={styles.headerBtn} disabled={saving}>
                  <Ionicons name="close" size={22} color={saving ? "#ccc" : "#555"} />
                </TouchableOpacity>
              ) : <View style={styles.headerBtn} />}
            </View>

            <View style={styles.content}>
              {step === "book" && (
                <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
                  <Text style={styles.sectionLabel}>Old Testament</Text>
                  <BookGrid books={OT_BOOKS} onSelect={handleSelectBook} size={BOOK_SIZE} />
                  <Text style={styles.sectionLabel}>New Testament</Text>
                  <BookGrid books={NT_BOOKS} onSelect={handleSelectBook} size={BOOK_SIZE} />
                </ScrollView>
              )}

              {step === "chapter" && selectedBook && (
                <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
                  <NumGrid count={selectedBook.chapters} onSelect={handleSelectChapter} size={NUM_SIZE} />
                </ScrollView>
              )}

              {step === "verse" && (
                saving ? (
                  <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Fetching verse…</Text>
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
                    {saveError && (
                      <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{saveError}</Text>
                      </View>
                    )}
                    <NumGrid
                      count={verseCount}
                      onSelect={handleSelectVerse}
                      size={NUM_SIZE}
                      highlightedNum={pendingVerse}
                    />
                  </ScrollView>
                )
              )}
            </View>

          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

function BookGrid({ books, onSelect, size }: { books: BibleBook[]; onSelect: (b: BibleBook) => void; size: number }) {
  return (
    <View style={styles.grid}>
      {books.map(book => (
        <TouchableOpacity
          key={book.full}
          style={[styles.squareBtn, { width: size, height: size }]}
          onPress={() => onSelect(book)}
        >
          <Text style={styles.bookAbbr}>{book.abbr}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function NumGrid({
  count, onSelect, size, highlightedNum,
}: {
  count: number;
  onSelect: (n: number) => void;
  size: number;
  highlightedNum?: number | null;
}) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, i) => i + 1).map(n => (
        <TouchableOpacity
          key={n}
          style={[
            styles.squareBtn,
            { width: size, height: size },
            highlightedNum === n && styles.squareBtnActive,
          ]}
          onPress={() => onSelect(n)}
        >
          <Text style={[styles.numText, highlightedNum === n && styles.numTextActive]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const BOOK_SIZE = 64;
const NUM_SIZE  = 60;

const styles = StyleSheet.create({
  overlay:   { flex: 1, justifyContent: "flex-end" },
  backdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet:     { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "88%" },
  inner:     { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerBtn: { width: 40, alignItems: "center", padding: 4 },
  title:     { flex: 1, fontSize: 17, fontWeight: "700", color: "#333", textAlign: "center" },
  content:   { flex: 1 },
  scrollPad: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  grid:      { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  squareBtn: {
    borderRadius: 14,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d0dcf5",
  },
  squareBtnActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  bookAbbr:  { fontSize: 13, fontWeight: "700", color: "#2255cc" },
  numText:   { fontSize: 15, fontWeight: "700", color: "#2255cc" },
  numTextActive: { color: "#fff" },
  center:    { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  errorBanner: {
    backgroundColor: "#fff0f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffd0d0",
  },
  errorText: { fontSize: 13, color: "#c00", textAlign: "center" },
});
