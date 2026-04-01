import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from "react-native";
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
    <View style={styles.grid}>
      {books.map((book) => (
        <TouchableOpacity key={book.full} style={styles.bookButton} onPress={() => onSelect(book)}>
          <Text style={styles.bookAbbr}>{book.abbr}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function BookPickerModal({ visible, onClose, onSelectBook }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={styles.title}>Select a Book</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Old Testament</Text>
              <BookGrid books={OT_BOOKS} onSelect={onSelectBook} />
              <Text style={styles.sectionLabel}>New Testament</Text>
              <BookGrid books={NT_BOOKS} onSelect={onSelectBook} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const BUTTON_SIZE = 64;
const GAP = 8;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    marginBottom: 16,
  },
  bookButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 14,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d0dcf5",
  },
  bookAbbr: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2255cc",
  },
});
