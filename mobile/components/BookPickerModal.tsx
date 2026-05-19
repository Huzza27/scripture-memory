import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface BibleBook {
  abbr: string;
  full: string;
}

const OT_BOOKS: BibleBook[] = [
  { abbr: "Gen", full: "Genesis" },
  { abbr: "Exo", full: "Exodus" },
  { abbr: "Lev", full: "Leviticus" },
  { abbr: "Num", full: "Numbers" },
  { abbr: "Deu", full: "Deuteronomy" },
  { abbr: "Jos", full: "Joshua" },
  { abbr: "Jdg", full: "Judges" },
  { abbr: "Rut", full: "Ruth" },
  { abbr: "1Sa", full: "1 Samuel" },
  { abbr: "2Sa", full: "2 Samuel" },
  { abbr: "1Ki", full: "1 Kings" },
  { abbr: "2Ki", full: "2 Kings" },
  { abbr: "1Ch", full: "1 Chronicles" },
  { abbr: "2Ch", full: "2 Chronicles" },
  { abbr: "Ezr", full: "Ezra" },
  { abbr: "Neh", full: "Nehemiah" },
  { abbr: "Est", full: "Esther" },
  { abbr: "Job", full: "Job" },
  { abbr: "Psa", full: "Psalms" },
  { abbr: "Pro", full: "Proverbs" },
  { abbr: "Ecc", full: "Ecclesiastes" },
  { abbr: "Sng", full: "Song of Solomon" },
  { abbr: "Isa", full: "Isaiah" },
  { abbr: "Jer", full: "Jeremiah" },
  { abbr: "Lam", full: "Lamentations" },
  { abbr: "Eze", full: "Ezekiel" },
  { abbr: "Dan", full: "Daniel" },
  { abbr: "Hos", full: "Hosea" },
  { abbr: "Joe", full: "Joel" },
  { abbr: "Amo", full: "Amos" },
  { abbr: "Oba", full: "Obadiah" },
  { abbr: "Jon", full: "Jonah" },
  { abbr: "Mic", full: "Micah" },
  { abbr: "Nah", full: "Nahum" },
  { abbr: "Hab", full: "Habakkuk" },
  { abbr: "Zep", full: "Zephaniah" },
  { abbr: "Hag", full: "Haggai" },
  { abbr: "Zec", full: "Zechariah" },
  { abbr: "Mal", full: "Malachi" },
];

const NT_BOOKS: BibleBook[] = [
  { abbr: "Mat", full: "Matthew" },
  { abbr: "Mrk", full: "Mark" },
  { abbr: "Luk", full: "Luke" },
  { abbr: "Jhn", full: "John" },
  { abbr: "Act", full: "Acts" },
  { abbr: "Rom", full: "Romans" },
  { abbr: "1Co", full: "1 Corinthians" },
  { abbr: "2Co", full: "2 Corinthians" },
  { abbr: "Gal", full: "Galatians" },
  { abbr: "Eph", full: "Ephesians" },
  { abbr: "Php", full: "Philippians" },
  { abbr: "Col", full: "Colossians" },
  { abbr: "1Th", full: "1 Thessalonians" },
  { abbr: "2Th", full: "2 Thessalonians" },
  { abbr: "1Ti", full: "1 Timothy" },
  { abbr: "2Ti", full: "2 Timothy" },
  { abbr: "Tit", full: "Titus" },
  { abbr: "Phm", full: "Philemon" },
  { abbr: "Heb", full: "Hebrews" },
  { abbr: "Jam", full: "James" },
  { abbr: "1Pe", full: "1 Peter" },
  { abbr: "2Pe", full: "2 Peter" },
  { abbr: "1Jn", full: "1 John" },
  { abbr: "2Jn", full: "2 John" },
  { abbr: "3Jn", full: "3 John" },
  { abbr: "Jud", full: "Jude" },
  { abbr: "Rev", full: "Revelation" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectBook: (book: BibleBook) => void;
}

function BookGrid({ books, onSelect }: { books: BibleBook[]; onSelect: (b: BibleBook) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-4">
      {books.map((book) => (
        <TouchableOpacity
          key={book.full}
          className="w-16 h-16 rounded-[14px] bg-[#f0f4ff] items-center justify-center border border-[#d0dcf5]"
          onPress={() => onSelect(book)}
        >
          <Text className="text-[13px] font-bold text-[#2255cc]">{book.abbr}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function BookPickerModal({ visible, onClose, onSelectBook }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} activeOpacity={1} onPress={onClose} />
        <View className="bg-white rounded-t-[20px] pb-4" style={{ maxHeight: "85%" }}>
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-[#eee]">
              <Text className="text-lg font-bold text-[#333]">Select a Book</Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-[#999] tracking-widest uppercase mb-[10px] mt-2">Old Testament</Text>
              <BookGrid books={OT_BOOKS} onSelect={onSelectBook} />
              <Text className="text-xs font-bold text-[#999] tracking-widest uppercase mb-[10px] mt-2">New Testament</Text>
              <BookGrid books={NT_BOOKS} onSelect={onSelectBook} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
