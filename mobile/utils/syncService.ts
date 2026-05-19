/**
 * syncService — fire-and-forget sync layer.
 *
 * Sits above storage (pure AsyncStorage I/O) and bibleApi (network).
 * Storage operations call these helpers instead of importing bibleApi directly.
 * All failures are logged but never throw — they must not interrupt local UX.
 */
import bibleApi from '../api/bibleApi';
import { SavedVerse, Folder, VerseProgress, PracticeStreak } from './storage';

function fire(fn: () => Promise<unknown>) {
  if (!bibleApi.isAuthenticated()) return;
  fn().catch(e => console.warn('[sync]', e));
}

export const syncService = {
  verse: {
    upsert(v: SavedVerse) {
      fire(() => bibleApi.syncUpsertVerse({
        id: v.id, reference: v.reference, text: v.text,
        translation: v.translation, createdAt: v.savedAt,
        songUri: v.songUri, songStyle: v.songStyle,
      }));
    },
    delete(id: string) {
      fire(() => bibleApi.syncDeleteVerse(id));
    },
  },

  folder: {
    upsert(f: Folder) {
      fire(() => bibleApi.syncUpsertFolder({
        id: f.id, name: f.name, color: f.color,
        createdAt: f.createdAt, verseIds: f.verseIds,
      }));
    },
    delete(id: string) {
      fire(() => bibleApi.syncDeleteFolder(id));
    },
  },

  progress: {
    upsert(verseId: string, p: VerseProgress) {
      fire(() => bibleApi.syncUpsertProgress(verseId, p));
    },
  },

  streak: {
    upsert(s: PracticeStreak) {
      fire(() => bibleApi.syncUpsertStreak(s));
    },
  },
};
