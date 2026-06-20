import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View, Text, TouchableOpacity, Animated,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { folderStorage, verseStorage, SavedVerse, Folder } from "../../utils/storage";
import { useTheme } from "../../utils/theme";

type CardType = "ref-to-verse" | "verse-to-ref";
type Phase = "session" | "result";

interface Card {
  verse: SavedVerse;
  type: CardType;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardSession() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [verse, setVerses] = useState<
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>("session");
  const [loading, setLoading] = useState(true);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const [folders, allVerses] = await Promise.all([
        folderStorage.getFolders(),
        verseStorage.getSavedVerses(),
      ]);
      const found = folders.find(f => f.id === id);
      if (!found) return;
      setFolder(found);
      const folderVerses = allVerses.filter(v => found.verseIds.includes(v.id));
      const deck: Card[] = shuffle(
        folderVerses.map(v => ({ verse: v, type: Math.random() < 0.5 ? "ref-to-verse" : "verse-to-ref" as CardType }))
      );
      setCards(deck);
      setLoading(false);
    })();
  }, [id]);

  useFocusEffect(useCallback(() => {
    return () => {
      // Reset when leaving so next visit starts fresh
      setIndex(0);
      setCorrect(0);
      setIncorrect(0);
      setRevealed(false);
      flipAnim.setValue(0);
      slideAnim.setValue(0);
      setPhase("session");
    };
  }, []));

  const flipCard = () => {
    if (revealed) return;
    Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }).start();
    setRevealed(true);
  };

  const handleAnswer = (wasCorrect: boolean) => {
    if (wasCorrect) setCorrect(c => c + 1);
    else setIncorrect(c => c + 1);

    const next = index + 1;
    if (next >= cards.length) {
      setPhase("result");
      return;
    }

    // Slide out then reset for next card
    Animated.timing(slideAnim, { toValue: wasCorrect ? -400 : 400, duration: 200, useNativeDriver: true }).start(() => {
      setIndex(next);
      setRevealed(false);
      flipAnim.setValue(0);
      slideAnim.setValue(0);
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-10" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!folder || cards.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-10" style={{ backgroundColor: theme.background }}>
        <Ionicons name="book-outline" size={48} color={theme.borderDisabled} />
        <Text className="text-lg mt-4 mb-6" style={{ color: theme.textTertiary }}>No verses in this folder</Text>
        <TouchableOpacity
          className="rounded-xl py-3.5 px-7"
          style={{ backgroundColor: theme.accent }}
          onPress={() => router.back()}
        >
          <Text className="text-white text-base font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === "result") {
    const total = correct + incorrect;
    const pct = Math.round((correct / total) * 100);
    const grade = pct === 100 ? "Perfect!" : pct >= 80 ? "Great" : pct >= 60 ? "Good" : "Keep Practicing";
    const gradeColor = pct === 100 ? theme.green : pct >= 80 ? theme.accent : pct >= 60 ? theme.orange : theme.red;

    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <View className="flex-row items-center justify-between pt-[60px] px-5 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="close" size={24} color={theme.accent} />
          </TouchableOpacity>
          <Text className="text-lg font-bold" style={{ color: theme.text }}>{folder.name}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="trophy-outline" size={64} color={gradeColor} style={{ marginBottom: 16 }} />
          <Text className="text-2xl font-extrabold mb-1" style={{ color: gradeColor }}>{grade}</Text>
          <Text className="font-black" style={{ fontSize: 64, lineHeight: 72, color: gradeColor }}>{pct}%</Text>
          <Text className="text-base mt-2 mb-10" style={{ color: theme.textTertiary }}>{correct} / {total} correct</Text>

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl p-3.5"
              style={{ borderWidth: 1.5, borderColor: theme.accent }}
              onPress={() => {
                const deck: Card[] = shuffle(
                  cards.map(c => ({ verse: c.verse, type: Math.random() < 0.5 ? "ref-to-verse" : "verse-to-ref" as CardType }))
                );
                setCards(deck);
                setIndex(0);
                setCorrect(0);
                setIncorrect(0);
                setRevealed(false);
                flipAnim.setValue(0);
                setPhase("session");
              }}
            >
              <Ionicons name="refresh" size={18} color={theme.accent} />
              <Text className="text-base font-semibold" style={{ color: theme.accent }}>Shuffle & Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl p-3.5 items-center"
              style={{ backgroundColor: theme.accent }}
              onPress={() => router.back()}
            >
              <Text className="text-white text-base font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const card = cards[index];
  const frontText = card.type === "ref-to-verse" ? card.verse.reference : card.verse.text;
  const backText = card.type === "ref-to-verse" ? card.verse.text : card.verse.reference;
  const frontLabel = card.type === "ref-to-verse" ? "Reference" : "Verse";
  const backLabel = card.type === "ref-to-verse" ? "Verse" : "Reference";

  // 3D flip: front rotates 0→180, back starts at -180→0
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });
  // Opacity failsafe for Android where backfaceVisibility can be unreliable
  const frontOpacity = flipAnim.interpolate({ inputRange: [0.5, 0.51], outputRange: [1, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0.49, 0.5], outputRange: [0, 1] });
  const progress = (index / cards.length) * 100;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-row items-center justify-between pt-[60px] px-5 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="close" size={24} color={theme.accent} />
        </TouchableOpacity>
        <Text className="text-lg font-bold" style={{ color: theme.text }}>{folder.name}</Text>
        <Text className="text-sm font-semibold" style={{ color: theme.textTertiary }}>{index + 1}/{cards.length}</Text>
      </View>

      {/* Progress bar */}
      <View className="h-1 mx-5 rounded-sm" style={{ backgroundColor: theme.surfaceMuted }}>
        <View style={{ height: 4, borderRadius: 2, width: `${progress}%`, backgroundColor: folder.color }} />
      </View>

      {/* Score strip */}
      <View className="flex-row justify-center gap-6 py-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="checkmark-circle" size={16} color={theme.green} />
          <Text className="text-base font-bold" style={{ color: theme.green }}>{correct}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="close-circle" size={16} color={theme.red} />
          <Text className="text-base font-bold" style={{ color: theme.red }}>{incorrect}</Text>
        </View>
      </View>

      {/* Card */}
      <Animated.View
        className="flex-1 px-5 pb-4 justify-center"
        style={{ transform: [{ translateX: slideAnim }] }}
      >
        <TouchableOpacity
          className="flex-1 rounded-[20px] overflow-hidden"
          style={{ borderWidth: 1, borderColor: theme.border, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
          onPress={flipCard}
          activeOpacity={1}
        >
          {/* Front */}
          <Animated.View
            className="absolute inset-0 items-center justify-center p-8 rounded-[20px]"
            style={{ opacity: frontOpacity, transform: [{ perspective: 1200 }, { rotateY: frontRotate }], backgroundColor: theme.surface, backfaceVisibility: "hidden" }}
          >
            <Text
              className="text-[11px] font-bold uppercase mb-5"
              style={{ color: theme.textTertiary, letterSpacing: 1 }}
            >
              {frontLabel}
            </Text>
            <Text
              className="text-center"
              style={[
                { fontSize: 17, lineHeight: 28, color: theme.text },
                card.type === "ref-to-verse" && { fontSize: 24, fontWeight: "800", color: theme.accent, lineHeight: 34 },
              ]}
            >
              {frontText}
            </Text>
            {!revealed && (
              <View className="flex-row items-center gap-1.5 mt-8">
                <Ionicons name="hand-left-outline" size={14} color={theme.textMuted} />
                <Text className="text-sm" style={{ color: theme.textMuted }}>Tap to reveal</Text>
              </View>
            )}
          </Animated.View>

          {/* Back */}
          <Animated.View
            className="absolute inset-0 items-center justify-center p-8 rounded-[20px]"
            style={{ opacity: backOpacity, transform: [{ perspective: 1200 }, { rotateY: backRotate }], backgroundColor: theme.accentSurface, backfaceVisibility: "hidden" }}
          >
            <Text
              className="text-[11px] font-bold uppercase mb-5"
              style={{ color: theme.textTertiary, letterSpacing: 1 }}
            >
              {backLabel}
            </Text>
            <Text
              className="text-center"
              style={[
                { fontSize: 17, lineHeight: 28, color: theme.text },
                card.type === "verse-to-ref" && { fontSize: 24, fontWeight: "800", color: theme.accent, lineHeight: 34 },
              ]}
            >
              {backText}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Answer buttons */}
      {revealed && (
        <View className="flex-row gap-4 px-5 pb-10">
          <TouchableOpacity
            className="flex-1 items-center justify-center gap-1 rounded-2xl p-4"
            style={{ borderWidth: 2, borderColor: theme.red }}
            onPress={() => handleAnswer(false)}
          >
            <Ionicons name="close" size={28} color={theme.red} />
            <Text className="text-sm font-bold" style={{ color: theme.red }}>Incorrect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center justify-center gap-1 rounded-2xl p-4"
            style={{ borderWidth: 2, borderColor: theme.green }}
            onPress={() => handleAnswer(true)}
          >
            <Ionicons name="checkmark" size={28} color={theme.green} />
            <Text className="text-sm font-bold" style={{ color: theme.green }}>Correct</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
