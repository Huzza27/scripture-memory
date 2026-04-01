// Simple storage for saved verses using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_verses';
const PROGRESS_KEY = '@verse_progress';
const MAX_SAVED_VERSES = 10;

export interface VerseProgress {
  verseId: string;
  stage: 1 | 2 | 3;           // current stage
  recentAccuracies: number[];  // last 2 attempt scores
  streak: number;              // consecutive correct attempts (>=90%)
  attempts: number;            // total attempts
  lastAttempt: string;         // ISO timestamp
  mastered: boolean;
}

const ADVANCE_THRESHOLD = 0.9;  // 90% accuracy
const ADVANCE_STREAK = 2;       // 2 consecutive attempts needed

// ── Folders ──────────────────────────────────────────────────────────────────

const FOLDERS_KEY = '@folders';

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  verseIds: string[];
}

export const FOLDER_COLORS = [
  "#FF6B6B", "#FF9500", "#FFCC00", "#34C759",
  "#007AFF", "#5856D6", "#AF52DE", "#8E8E93",
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
    return folder;
  },

  async deleteFolder(id: string): Promise<void> {
    const folders = await this.getFolders();
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders.filter(f => f.id !== id)));
  },

  async addVerseToFolder(folderId: string, verseId: string): Promise<void> {
    const folders = await this.getFolders();
    const updated = folders.map(f =>
      f.id === folderId && !f.verseIds.includes(verseId)
        ? { ...f, verseIds: [...f.verseIds, verseId] }
        : f
    );
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
  },

  async removeVerseFromFolder(folderId: string, verseId: string): Promise<void> {
    const folders = await this.getFolders();
    const updated = folders.map(f =>
      f.id === folderId ? { ...f, verseIds: f.verseIds.filter(id => id !== verseId) } : f
    );
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
  },

  async removeVerseFromAllFolders(verseId: string): Promise<void> {
    const folders = await this.getFolders();
    const updated = folders.map(f => ({ ...f, verseIds: f.verseIds.filter(id => id !== verseId) }));
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
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
    };

    const recentAccuracies = [...prev.recentAccuracies, accuracy].slice(-2);
    const streak = accuracy >= ADVANCE_THRESHOLD ? prev.streak + 1 : 0;
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

    const progress: VerseProgress = {
      verseId,
      stage,
      recentAccuracies,
      streak: advanced ? 0 : streak,
      attempts,
      lastAttempt: new Date().toISOString(),
      mastered,
    };

    all[verseId] = progress;
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
    return { progress, advanced, mastered };
  },

  async reset(verseId: string): Promise<void> {
    const all = await this.getAll();
    delete all[verseId];
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
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

      // Keep only the first 10
      const limited = updated.slice(0, MAX_SAVED_VERSES);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
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
