import AsyncStorage from '@react-native-async-storage/async-storage';
import bibleApi from '../api/bibleApi';

/**
 * Replace local AsyncStorage with server data (server wins).
 * Called on login — after any local migration has been uploaded.
 * Errors are intentionally not caught here; callers decide how to handle.
 */
export async function pullFromCloud(): Promise<void> {
  const [serverVerses, serverFolders, serverProgress, serverStreak] = await Promise.all([
    bibleApi.syncGetVerses(),
    bibleApi.syncGetFolders(),
    bibleApi.syncGetProgress(),
    bibleApi.syncGetStreak(),
  ]);

  // Map snake_case server fields → camelCase local fields
  const verses = serverVerses.map((v: Record<string, unknown>) => ({
    id: v.id,
    reference: v.reference,
    text: v.text,
    translation: v.translation,
    savedAt: v.created_at,
    songUri: v.song_uri || undefined,
    songStyle: v.song_style || undefined,
  }));

  const folders = serverFolders.map((f: Record<string, unknown>) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    createdAt: f.created_at,
    verseIds: (f.verseIds as string[]) || [],
  }));

  await Promise.all([
    AsyncStorage.setItem('@saved_verses', JSON.stringify(verses)),
    AsyncStorage.setItem('@folders', JSON.stringify(folders)),
    AsyncStorage.setItem('@verse_progress', JSON.stringify(serverProgress || {})),
    serverStreak
      ? AsyncStorage.setItem('@practice_streak', JSON.stringify(serverStreak))
      : Promise.resolve(),
  ]);
}
