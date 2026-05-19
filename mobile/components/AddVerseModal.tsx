import { useState } from "react";
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OT_BOOKS, NT_BOOKS, BibleBook, getVerseCount } from "../utils/bibleData";
import { TRANSLATIONS } from "./TranslationPicker";
import bibleApi from "../api/bibleApi";

type Step = "book" | "chapter" | "verse";

interface Props {
  visible: boolean;
  onClose: () => void;
  onVerseSelected: (reference: string, text: string, translation: string) => void;
}

export default function AddVerseModal({ visible, onClose, onVerseSelected }: Props) {
  const [step, setStep] = useState<Step>("book");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState("kjv");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingVerse, setPendingVerse] = useState<number | null>(null);

  const reset = () => {
    setStep("book");
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedTranslation("kjv");
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
      const resp = await bibleApi.getVerse(reference, selectedTranslation);
      if (resp.success && resp.data) {
        onVerseSelected(reference, resp.data.text.trim(), selectedTranslation);
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

              {step === "verse" && (
                saving ? (
                  <View className="flex-1 items-center justify-center p-8">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="mt-3 text-sm text-[#666]">Fetching verse…</Text>
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
  count, onSelect, size, highlightedNum,
}: {
  count: number;
  onSelect: (n: number) => void;
  size: number;
  highlightedNum?: number | null;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-2">
      {Array.from({ length: count }, (_, i) => i + 1).map(n => (
        <TouchableOpacity
          key={n}
          style={{ width: size, height: size }}
          className={`rounded-[14px] items-center justify-center border ${highlightedNum === n ? "bg-[#007AFF] border-[#007AFF]" : "bg-[#f0f4ff] border-[#d0dcf5]"}`}
          onPress={() => onSelect(n)}
        >
          <Text className={`text-[15px] font-bold ${highlightedNum === n ? "text-white" : "text-[#2255cc]"}`}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const BOOK_SIZE = 64;
const NUM_SIZE  = 60;
