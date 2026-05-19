// Simple storage for saved verses using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from './syncService';

const STORAGE_KEY = '@saved_verses';
const PROGRESS_KEY = '@verse_progress';
const STREAK_KEY = '@practice_streak';

export interface VerseProgress {
  verseId: string;
  stage: 1 | 2 | 3;           // current stage
  recentAccuracies: number[];  // last 2 attempt scores
  streak: number;              // consecutive correct attempts (>=90%)
  attempts: number;            // total attempts
  lastAttempt: string;         // ISO timestamp
  mastered: boolean;
  nextReview: string;          // ISO date (YYYY-MM-DD) — when due for review
  intervalDays: number;        // current SRS interval
}

export interface PracticeStreak {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;    // ISO date (YYYY-MM-DD)
  totalDays: number;
}

const ADVANCE_THRESHOLD = 0.9;  // 90% accuracy
const ADVANCE_STREAK = 2;       // 2 consecutive attempts needed

// SRS interval ladder (days)
const SRS_INTERVALS: Record<string, number> = { fail: 1, s1: 1, s2: 3, s3: 7, mastered: 30 };

function calcNextReview(stage: 1 | 2 | 3, mastered: boolean, passed: boolean): { nextReview: string; intervalDays: number } {
  const days = !passed ? SRS_INTERVALS.fail
    : mastered ? SRS_INTERVALS.mastered
    : stage === 1 ? SRS_INTERVALS.s1
    : stage === 2 ? SRS_INTERVALS.s2
    : SRS_INTERVALS.s3;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return { nextReview: date.toISOString().split('T')[0], intervalDays: days };
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Folders ──────────────────────────────────────────────────────────────────

const FOLDERS_KEY = '@folders';

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  verseIds: string[];
}

// Neutral default — slate-500, works on both light and dark themes
export const FOLDER_COLOR_DEFAULT = "#64748b";

// Tailwind 500-level palette — harmonizes with the Slate dark theme
export const FOLDER_COLORS = [
  FOLDER_COLOR_DEFAULT, // slate-500 (default)
  "#3b82f6",            // blue-500
  "#22c55e",            // green-500
  "#f59e0b",            // amber-500
  "#ef4444",            // red-500
  "#8b5cf6",            // violet-500
  "#ec4899",            // pink-500
  "#14b8a6",            // teal-500
];

export const folderStorage = {
  async getFolders(): Promise<Folder[]> {
    try {
      const data = await AsyncStorage.getItem(FOLDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async createFolder(name: string, color: string): Promise<Folder> {
    const folder: Folder = { id: Date.now().toString(), name, color, createdAt: new Date().toISOString(), verseIds: [] };
    const folders = await this.getFolders();
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify([...folders, folder]));
    syncService.folder.upsert(folder);
    return folder;
  },

  async deleteFolder(id: string): Promise<void> {
    const folders = await this.getFolders();
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders.filter(f => f.id !== id)));
    syncService.folder.delete(id);
  },

  async updateFolder(id: string, updates: { name?: string; color?: string }): Promise<void> {
    const folders = await this.getFolders();
    const updated = folders.map(f => f.id === id ? { ...f, ...updates } : f);
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
    const f = updated.find(x => x.id === id);
    if (f) syncService.folder.upsert(f);
  },

  async addVerseToFolder(folderId: string, verseId: string): Promise<void> {
    const folders = await this.getFolders();
    const updated = folders.map(f =>
      f.id === folderId && !f.verseIds.includes(verseId)
        ? { ...f, verseIds: [...f.verseIds, verseId] }
        : f
    );
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
    const f = updated.find(x => x.id === folderId);
    if (f) syncService.folder.upsert(f);
  },

  async removeVerseFromFolder(folderId: string, verseId: string): Promise<void> {
    const folders = await this.getFolders();
    const updated = folders.map(f =>
      f.id === folderId ? { ...f, verseIds: f.verseIds.filter(id => id !== verseId) } : f
    );
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
    const f = updated.find(x => x.id === folderId);
    if (f) syncService.folder.upsert(f);
  },

  async removeVerseFromAllFolders(verseId: string): Promise<void> {
    const folders = await this.getFolders();
    const changed = folders.filter(f => f.verseIds.includes(verseId));
    const updated = folders.map(f => ({ ...f, verseIds: f.verseIds.filter(id => id !== verseId) }));
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
    for (const orig of changed) {
      const f = updated.find(x => x.id === orig.id);
      if (f) syncService.folder.upsert(f);
    }
  },

  async getFoldersForVerse(verseId: string): Promise<Folder[]> {
    const folders = await this.getFolders();
    return folders.filter(f => f.verseIds.includes(verseId));
  },
};

// ── Progress ──────────────────────────────────────────────────────────────────

export const progressStorage = {
  async getAll(): Promise<Record<string, VerseProgress>> {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async get(verseId: string): Promise<VerseProgress | null> {
    const all = await this.getAll();
    return all[verseId] ?? null;
  },

  /**
   * Record a practice attempt. Returns the updated progress and whether stage advanced.
   * Also updates the daily practice streak.
   */
  async recordAttempt(verseId: string, accuracy: number): Promise<{ progress: VerseProgress; advanced: boolean; mastered: boolean }> {
    const all = await this.getAll();
    const prev = all[verseId] ?? {
      verseId,
      stage: 1 as const,
      recentAccuracies: [],
      streak: 0,
      attempts: 0,
      lastAttempt: new Date().toISOString(),
      mastered: false,
      nextReview: today(),
      intervalDays: 0,
    };

    const recentAccuracies = [...prev.recentAccuracies, accuracy].slice(-2);
    const passed = accuracy >= ADVANCE_THRESHOLD;
    const streak = passed ? prev.streak + 1 : 0;
    const attempts = prev.attempts + 1;

    let stage = prev.stage;
    let advanced = false;
    let mastered = prev.mastered;

    // Advance stage if streak reached threshold
    if (streak >= ADVANCE_STREAK && !prev.mastered) {
      if (stage < 3) {
        stage = (stage + 1) as 1 | 2 | 3;
        advanced = true;
      } else {
        mastered = true;
      }
    }

    const { nextReview, intervalDays } = calcNextReview(stage, mastered, passed);

    const progress: VerseProgress = {
      verseId,
      stage,
      recentAccuracies,
      streak: advanced ? 0 : streak,
      attempts,
      lastAttempt: new Date().toISOString(),
      mastered,
      nextReview,
      intervalDays,
    };

    all[verseId] = progress;
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
    syncService.progress.upsert(verseId, progress);
    await streakStorage.recordPracticeDay();
    return { progress, advanced, mastered };
  },

  async getDueVerseIds(): Promise<string[]> {
    const all = await this.getAll();
    const t = today();
    return Object.values(all)
      .filter(p => !p.nextReview || p.nextReview <= t)
      .map(p => p.verseId);
  },

  async reset(verseId: string): Promise<void> {
    const all = await this.getAll();
    delete all[verseId];
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  },
};

// ── Streak ────────────────────────────────────────────────────────────────────

export const streakStorage = {
  async get(): Promise<PracticeStreak> {
    try {
      const data = await AsyncStorage.getItem(STREAK_KEY);
      return data ? JSON.parse(data) : { currentStreak: 0, longestStreak: 0, lastPracticeDate: '', totalDays: 0 };
    } catch {
      return { currentStreak: 0, longestStreak: 0, lastPracticeDate: '', totalDays: 0 };
    }
  },

  async recordPracticeDay(): Promise<PracticeStreak> {
    const streak = await this.get();
    const t = today();

    // Already counted today
    if (streak.lastPracticeDate === t) return streak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yd = yesterday.toISOString().split('T')[0];

    const newCurrent = streak.lastPracticeDate === yd ? streak.currentStreak + 1 : 1;
    const updated: PracticeStreak = {
      currentStreak: newCurrent,
      longestStreak: Math.max(streak.longestStreak, newCurrent),
      lastPracticeDate: t,
      totalDays: streak.totalDays + 1,
    };
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    syncService.streak.upsert(updated);
    return updated;
  },
};

export interface SavedVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  savedAt: string;
  songUri?: string;
  songStyle?: string;
  schedule?: number[]; // days to practice: 0=Sun, 1=Mon, …, 6=Sat. undefined = no schedule.
}

export const verseStorage = {
  /**
   * Get all saved verses
   */
  async getSavedVerses(): Promise<SavedVerse[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading saved verses:', error);
      return [];
    }
  },

  /**
   * Save a new verse (max 10, removes oldest if needed)
   */
  async saveVerse(verse: Omit<SavedVerse, 'id' | 'savedAt'>): Promise<void> {
    try {
      const saved = await this.getSavedVerses();

      // Check if already saved
      const exists = saved.find(v => v.reference === verse.reference);
      if (exists) return;

      // Create new verse with ID and timestamp
      const newVerse: SavedVerse = {
        ...verse,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
      };

      // Add to beginning of array (most recent first)
      const updated = [newVerse, ...saved];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      syncService.verse.upsert(newVerse);
    } catch (error) {
      console.error('Error saving verse:', error);
      throw error;
    }
  },

  /**
   * Delete a saved verse
   */
  async deleteVerse(id: string): Promise<void> {
    try {
      const saved = await this.getSavedVerses();
      const filtered = saved.filter(v => v.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      syncService.verse.delete(id);
    } catch (error) {
      console.error('Error deleting verse:', error);
      throw error;
    }
  },

  /**
   * Update fields on an existing verse (e.g. songUri after generation)
   */
  async updateVerse(id: string, updates: Partial<SavedVerse>): Promise<void> {
    try {
      const saved = await this.getSavedVerses();
      const updated = saved.map(v => v.id === id ? { ...v, ...updates } : v);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      const v = updated.find(x => x.id === id);
      if (v) syncService.verse.upsert(v);
    } catch (error) {
      console.error('Error updating verse:', error);
      throw error;
    }
  },

  /**
   * Clear all saved verses
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing verses:', error);
      throw error;
    }
  },
};
