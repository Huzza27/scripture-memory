import { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { verseStorage, progressStorage, folderStorage, streakStorage, SavedVerse, VerseProgress, Folder, PracticeStreak } from "../utils/storage";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme } from "../utils/theme";

const today = () => new Date().toISOString().split('T')[0];

function formatNextReview(nextReview?: string): string {
  if (!nextReview) return "";
  const t = today();
  if (nextReview <= t) return "Due now";
  const daysOut = Math.ceil((new Date(nextReview).getTime() - new Date(t).getTime()) / 86400000);
  if (daysOut === 1) return "Due tomorrow";
  return `Due in ${daysOut}d`;
}

export default function Stats() {
  const theme = useTheme();
  const [verses, setVerses] = useState<SavedVerse[]>([]);
  const [progress, setProgress] = useState<Record<string, VerseProgress>>({});
  const [folders, setFolders] = useState<Folder[]>([]);
  const [streak, setStreak] = useState<PracticeStreak>({ currentStreak: 0, longestStreak: 0, lastPracticeDate: '', totalDays: 0 });
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    Promise.all([
      verseStorage.getSavedVerses(),
      progressStorage.getAll(),
      folderStorage.getFolders(),
      streakStorage.get(),
    ]).then(([v, p, f, s]) => {
      setVerses(v);
      setProgress(p);
      setFolders(f);
      setStreak(s);
      setLoading(false);
    });
  }, []));

  const mastered    = verses.filter(v => progress[v.id]?.mastered).length;
  const inProgress  = verses.filter(v => progress[v.id] && !progress[v.id].mastered).length;
  const notStarted  = verses.length - mastered - inProgress;
  const t = today();
  const dueVerseIds = new Set(
    Object.values(progress).filter(p => !p.nextReview || p.nextReview <= t).map(p => p.verseId)
  );
  const dueCount = verses.filter(v => dueVerseIds.has(v.id)).length;

  const getFolderForVerse = (verseId: string): Folder | null =>
    folders.find(f => f.verseIds.includes(verseId)) ?? null;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Progress" subtitle={`${verses.length} / 10 verses saved`} />

      {/* Streak banner */}
      <View
        className="flex-row items-center mx-4 mt-3 mb-1 rounded-2xl py-3.5 px-4"
        style={{ backgroundColor: theme.surface }}
      >
        <View className="flex-row items-center gap-2.5 flex-1">
          <Text style={{ fontSize: 28 }}>🔥</Text>
          <View>
            <Text className="text-3xl font-extrabold leading-8" style={{ color: theme.text }}>{streak.currentStreak}</Text>
            <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>day streak</Text>
          </View>
        </View>
        <View className="w-px h-8 mx-3.5" style={{ backgroundColor: theme.border }} />
        <View className="items-center gap-0.5">
          <Text className="text-xl font-extrabold" style={{ color: theme.text }}>{streak.longestStreak}</Text>
          <Text className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Best</Text>
        </View>
        <View className="w-px h-8 mx-3.5" style={{ backgroundColor: theme.border }} />
        <View className="items-center gap-0.5">
          <Text className="text-xl font-extrabold" style={{ color: theme.text }}>{streak.totalDays}</Text>
          <Text className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Total days</Text>
        </View>
        {dueCount > 0 && (
          <>
            <View className="w-px h-8 mx-3.5" style={{ backgroundColor: theme.border }} />
            <View className="items-center gap-0.5">
              <Text className="text-xl font-extrabold text-red-500">{dueCount}</Text>
              <Text className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Due today</Text>
            </View>
          </>
        )}
      </View>

      {/* Summary strip */}
      <View className="flex-row gap-3 px-4 py-3">
        <View
          className="flex-1 items-center gap-1.5 rounded-2xl py-4 border-t-[3px]"
          style={{ backgroundColor: theme.surface, borderTopColor: "#34c759" }}
        >
          <Ionicons name="trophy" size={22} color="#34c759" />
          <Text className="text-3xl font-extrabold leading-8 text-[#34c759]">{mastered}</Text>
          <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Mastered</Text>
        </View>
        <View
          className="flex-1 items-center gap-1.5 rounded-2xl py-4 border-t-[3px]"
          style={{ backgroundColor: theme.surface, borderTopColor: "#007AFF" }}
        >
          <Ionicons name="fitness-outline" size={22} color="#007AFF" />
          <Text className="text-3xl font-extrabold leading-8 text-[#007AFF]">{inProgress}</Text>
          <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>In Progress</Text>
        </View>
        <View
          className="flex-1 items-center gap-1.5 rounded-2xl py-4 border-t-[3px]"
          style={{ backgroundColor: theme.surface, borderTopColor: "#ddd" }}
        >
          <Ionicons name="ellipse-outline" size={22} color="#bbb" />
          <Text className="text-3xl font-extrabold leading-8 text-[#bbb]">{notStarted}</Text>
          <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Not Started</Text>
        </View>
      </View>

      {verses.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: theme.accentSurfaceAlt }}
          >
            <Ionicons name="bar-chart" size={40} color="#007AFF" />
          </View>
          <Text className="text-xl font-bold mb-2.5" style={{ color: theme.text }}>Nothing to show yet</Text>
          <Text className="text-sm text-center leading-5" style={{ color: theme.textTertiary }}>
            Add verses on the Home tab and start practicing to see your progress here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={v => v.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ListHeaderComponent={
            <Text className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: theme.textTertiary }}>All Verses</Text>
          }
          renderItem={({ item }) => {
            const p = progress[item.id];
            const folder = getFolderForVerse(item.id);
            const isDue = dueVerseIds.has(item.id);
            return (
              <View
                className="flex-row items-center py-3.5 border-b"
                style={{ borderBottomColor: theme.border }}
              >
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold" style={{ color: theme.text }}>{item.reference}</Text>
                    {isDue && p && (
                      <View className="bg-[#ef444420] rounded px-1.5 py-0.5">
                        <Text className="text-xs font-bold text-red-500">Due</Text>
                      </View>
                    )}
                  </View>
                  {folder && (
                    <View
                      className="flex-row items-center self-start gap-1 rounded-lg px-2 py-0.5"
                      style={{ backgroundColor: folder.color + "20" }}
                    >
                      <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
                      <Text className="text-xs font-semibold" style={{ color: folder.color }}>{folder.name}</Text>
                    </View>
                  )}
                </View>
                <View className="items-end gap-1">
                  {p?.mastered ? (
                    <>
                      <View
                        className="flex-row items-center gap-1 rounded-lg px-2.5 py-1"
                        style={{ backgroundColor: theme.orangeSurface }}
                      >
                        <Ionicons name="trophy" size={13} color="#f5a623" />
                        <Text className="text-xs font-bold text-[#f5a623]">Mastered</Text>
                      </View>
                      {p.nextReview && (
                        <Text className="text-[10px] font-medium" style={{ color: theme.textTertiary }}>{formatNextReview(p.nextReview)}</Text>
                      )}
                    </>
                  ) : (
                    <View className="items-end gap-1">
                      <Text className="text-xs font-semibold" style={{ color: theme.textTertiary }}>{p ? `Stage ${p.stage} / 3` : "Not started"}</Text>
                      <View className="flex-row gap-1">
                        {[1, 2, 3].map(i => (
                          <View
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: p && i <= p.stage ? theme.accent : theme.borderStrong }}
                          />
                        ))}
                      </View>
                      {p?.nextReview && (
                        <Text
                          className="text-[10px] font-medium"
                          style={{ color: isDue ? "#ef4444" : theme.textTertiary }}
                        >
                          {formatNextReview(p.nextReview)}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
