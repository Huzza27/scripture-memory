import { useState } from "react";
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OT_BOOKS, NT_BOOKS, BibleBook, getVerseCount } from "../utils/bibleData";
import { TRANSLATIONS } from "./TranslationPicker";
import bibleApi from "../api/bibleApi";

type Step = "book" | "chapter" | "start" | "end";

interface Props {
  visible: boolean;
  onClose: () => void;
  onPassageSelected: (reference: string, text: string, translation: string) => void;
}

export default function AddPassageModal({ visible, onClose, onPassageSelected }: Props) {
  const [step, setStep] = useState<Step>("book");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [startVerse, setStartVerse] = useState<number | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState("kjv");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingVerse, setPendingVerse] = useState<number | null>(null);

  const reset = () => {
    setStep("book");
    setSelectedBook(null);
    setSelectedChapter(null);
    setStartVerse(null);
    setSelectedTranslation("kjv");
    setSaving(false);
    setSaveError(null);
    setPendingVerse(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const goBack = () => {
    if (step === "chapter") { setStep("book"); setSelectedBook(null); }
    else if (step === "start") { setStep("chapter"); setSelectedChapter(null); setSaveError(null); }
    else if (step === "end") { setStep("start"); setStartVerse(null); setSaveError(null); }
  };

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setStep("chapter");
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setSaveError(null);
    setStep("start");
  };

  const handleSelectStart = (verse: number) => {
    setStartVerse(verse);
    setSaveError(null);
    setStep("end");
  };

  const handleSelectEnd = async (endVerse: number) => {
    if (!selectedBook || !selectedChapter || startVerse === null || saving) return;
    const reference = `${selectedBook.full} ${selectedChapter}:${startVerse}-${endVerse}`;
    setSaving(true);
    setSaveError(null);
    setPendingVerse(endVerse);
    try {
      const resp = await bibleApi.getVerseRange(
        selectedBook.full,
        selectedChapter,
        startVerse,
        endVerse,
        selectedTranslation
      );
      if (resp.success && resp.data) {
        onPassageSelected(reference, resp.data.text.trim(), selectedTranslation);
        reset();
      } else {
        setSaveError("Could not fetch passage. Try again.");
        setSaving(false);
        setPendingVerse(null);
      }
    } catch {
      setSaveError("Network error. Check your connection.");
      setSaving(false);
      setPendingVerse(null);
    }
  };

  const verseCount = selectedBook && selectedChapter
    ? getVerseCount(selectedBook.full, selectedChapter)
    : 0;

  const stepTitle =
    step === "book"    ? "Add Passage — Book" :
    step === "chapter" ? (selectedBook?.full ?? "Select Chapter") :
    step === "start"   ? `${selectedBook?.abbr} ${selectedChapter} — Start Verse` :
                         `${selectedBook?.abbr} ${selectedChapter}:${startVerse} — End Verse`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1">
        <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={handleClose} />
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px]" style={{ height: "88%" }}>
          <SafeAreaView className="flex-1">

            <View className="flex-row items-center px-2 pt-5 pb-3 border-b border-[#eee]">
              <TouchableOpacity
                onPress={step === "book" ? handleClose : goBack}
                className="w-10 items-center p-1"
                disabled={saving}
              >
                <Ionicons
                  name={step === "book" ? "close" : "chevron-back"}
                  size={22}
                  color={saving ? "#ccc" : step === "book" ? "#555" : "#007AFF"}
                />
              </TouchableOpacity>
              <Text className="flex-1 text-[17px] font-bold text-[#333] text-center" numberOfLines={1}>{stepTitle}</Text>
              {step !== "book" ? (
                <TouchableOpacity onPress={handleClose} className="w-10 items-center p-1" disabled={saving}>
                  <Ionicons name="close" size={22} color={saving ? "#ccc" : "#555"} />
                </TouchableOpacity>
              ) : <View className="w-10 items-center p-1" />}
            </View>

            {step === "end" && startVerse !== null && (
              <View className="flex-row items-center gap-[6px] bg-[#f0f6ff] px-4 py-2 border-b border-[#dde8ff]">
                <Ionicons name="information-circle-outline" size={14} color="#007AFF" />
                <Text className="text-xs text-[#007AFF] flex-1">
                  Start: verse {startVerse} — tap any verse at or after it to set the end
                </Text>
              </View>
            )}

            <View className="flex-1">
              {step === "book" && (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                  <Text className="text-[11px] font-bold text-[#999] tracking-widest uppercase mb-[10px] mt-2">Translation</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12, flexDirection: "row" }}>
                    {TRANSLATIONS.map(t => (
                      <TouchableOpacity
                        key={t.code}
                        className={`px-3 py-[7px] rounded-full border ${selectedTranslation === t.code ? "bg-[#007AFF] border-[#007AFF]" : "bg-[#f0f4ff] border-[#d0dcf5]"}`}
                        onPress={() => setSelectedTranslation(t.code)}
                      >
                        <Text className={`text-xs font-bold ${selectedTranslation === t.code ? "text-white" : "text-[#2255cc]"}`}>
                          {t.code.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text className="text-[11px] font-bold text-[#999] tracking-widest uppercase mb-[10px] mt-2">Old Testament</Text>
                  <BookGrid books={OT_BOOKS} onSelect={handleSelectBook} size={BOOK_SIZE} />
                  <Text className="text-[11px] font-bold text-[#999] tracking-widest uppercase mb-[10px] mt-2">New Testament</Text>
                  <BookGrid books={NT_BOOKS} onSelect={handleSelectBook} size={BOOK_SIZE} />
                </ScrollView>
              )}

              {step === "chapter" && selectedBook && (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                  <NumGrid count={selectedBook.chapters} onSelect={handleSelectChapter} size={NUM_SIZE} />
                </ScrollView>
              )}

              {step === "start" && (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                  <NumGrid count={verseCount} onSelect={handleSelectStart} size={NUM_SIZE} />
                </ScrollView>
              )}

              {step === "end" && startVerse !== null && (
                saving ? (
                  <View className="flex-1 items-center justify-center p-8">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="mt-3 text-sm text-[#666]">Fetching passage…</Text>
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {saveError && (
                      <View className="bg-[#fff0f0] rounded-lg p-3 mb-3 border border-[#ffd0d0]">
                        <Text className="text-[13px] text-[#cc0000] text-center">{saveError}</Text>
                      </View>
                    )}
                    <NumGrid
                      count={verseCount}
                      onSelect={handleSelectEnd}
                      size={NUM_SIZE}
                      highlightedNum={pendingVerse}
                      minNum={startVerse}
                      startNum={startVerse}
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
    <View className="flex-row flex-wrap gap-2 mb-2">
      {books.map(book => (
        <TouchableOpacity
          key={book.full}
          style={{ width: size, height: size }}
          className="rounded-[14px] bg-[#f0f4ff] items-center justify-center border border-[#d0dcf5]"
          onPress={() => onSelect(book)}
        >
          <Text className="text-[13px] font-bold text-[#2255cc]">{book.abbr}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function NumGrid({
  count, onSelect, size, highlightedNum, minNum, startNum,
}: {
  count: number;
  onSelect: (n: number) => void;
  size: number;
  highlightedNum?: number | null;
  minNum?: number;
  startNum?: number;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-2">
      {Array.from({ length: count }, (_, i) => i + 1).map(n => {
        const disabled = minNum !== undefined && n < minNum;
        const isStart = startNum !== undefined && n === startNum;
        const isActive = highlightedNum === n;
        return (
          <TouchableOpacity
            key={n}
            style={{ width: size, height: size }}
            className={`rounded-[14px] items-center justify-center border ${
              isActive
                ? "bg-[#007AFF] border-[#007AFF]"
                : isStart
                ? "bg-[#e8f4e8] border-[#a0d0a0]"
                : disabled
                ? "bg-[#f5f5f5] border-[#e5e5e5]"
                : "bg-[#f0f4ff] border-[#d0dcf5]"
            }`}
            onPress={() => !disabled && onSelect(n)}
            disabled={disabled}
          >
            <Text className={`text-[15px] font-bold ${
              isActive ? "text-white" : isStart ? "text-[#2a7a2a]" : disabled ? "text-[#cccccc]" : "text-[#2255cc]"
            }`}>
              {n}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const BOOK_SIZE = 64;
const NUM_SIZE  = 60;
