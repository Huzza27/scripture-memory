// Bible API Client
// Verse fetching calls bible-api.com directly (no backend required).
// Song generation still routes through the backend (ElevenLabs API key lives there).

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const BIBLE_API_URL = 'https://bible-api.com';

// Platform-safe base64 encoder (btoa is web-only)
function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < bytes.length ? chars[b2 & 63] : '=';
  }
  return result;
}

interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleResponse {
  success: boolean;
  data?: {
    reference: string;
    verses: Verse[];
    text: string;
    translation: string;
    translationName: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface SongGenerationResponse {
  success: boolean;
  jobId?: string;
  cached?: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface SongStatusResponse {
  success: boolean;
  status?: string;
  jobId?: string;
  audioUrl?: string | null;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface AuthResponse {
  token: string;
  user: { id: number; email: string; username: string };
}

class BibleApi {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Login failed');
    return data;
  }

  async getMe(): Promise<{ id: number; email: string; username: string; bio: string; created_at: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: this.authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch profile');
    return data.user;
  }

  async updateProfile(username: string, bio: string): Promise<{ id: number; email: string; username: string; bio: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({ username, bio }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to update profile');
    return data.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || 'Failed to change password');
    }
  }

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Registration failed');
    return data;
  }

  // ── Sync ────────────────────────────────────────────────────────────────────

  async syncGetVerses() {
    const res = await fetch(`${API_BASE_URL}/sync/verses`, { headers: this.authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch verses');
    return data.verses;
  }

  async syncUpsertVerse(verse: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/sync/verses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify(verse),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || 'Failed to save verse'); }
  }

  async syncDeleteVerse(id: string) {
    await fetch(`${API_BASE_URL}/sync/verses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  async syncBulkVerses(verses: Record<string, unknown>[]) {
    const res = await fetch(`${API_BASE_URL}/sync/verses/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({ verses }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || 'Bulk import failed'); }
  }

  async syncGetFolders() {
    const res = await fetch(`${API_BASE_URL}/sync/folders`, { headers: this.authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch folders');
    return data.folders;
  }

  async syncUpsertFolder(folder: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/sync/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify(folder),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || 'Failed to save folder'); }
  }

  async syncDeleteFolder(id: string) {
    await fetch(`${API_BASE_URL}/sync/folders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  async syncBulkFolders(folders: Record<string, unknown>[]) {
    const res = await fetch(`${API_BASE_URL}/sync/folders/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({ folders }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || 'Bulk folder import failed'); }
  }

  async syncGetProgress() {
    const res = await fetch(`${API_BASE_URL}/sync/progress`, { headers: this.authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch progress');
    return data.progress;
  }

  async syncUpsertProgress(verseId: string, progress: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/sync/progress/${encodeURIComponent(verseId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify(progress),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || 'Failed to save progress'); }
  }

  async syncGetStreak() {
    const res = await fetch(`${API_BASE_URL}/sync/streak`, { headers: this.authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch streak');
    return data.streak;
  }

  async syncUpsertStreak(streak: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/sync/streak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify(streak),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || 'Failed to save streak'); }
  }

  /**
   * Fetch verse text directly from bible-api.com (no backend required).
   */
  private async fetchFromBibleApi(reference: string, translation: string): Promise<BibleResponse> {
    const url = `${BIBLE_API_URL}/${encodeURIComponent(reference)}?translation=${translation}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${reference}`);
    const raw = await response.json();
    return {
      success: true,
      data: {
        reference: raw.reference,
        verses: raw.verses,
        text: raw.text,
        translation: raw.translation_id || translation,
        translationName: raw.translation_name,
      },
    };
  }

  /**
   * Fetch a verse by reference (e.g., "John 3:16")
   */
  async getVerse(reference: string, translation: string = 'kjv'): Promise<BibleResponse> {
    try {
      return await this.fetchFromBibleApi(reference, translation);
    } catch (error) {
      console.error('Bible API error:', error);
      throw error;
    }
  }

  /**
   * Fetch an entire chapter
   */
  async getChapter(book: string, chapter: number, translation: string = 'kjv'): Promise<BibleResponse> {
    try {
      return await this.fetchFromBibleApi(`${book} ${chapter}`, translation);
    } catch (error) {
      console.error('Bible API error:', error);
      throw error;
    }
  }

  /**
   * Fetch a range of verses
   */
  async getVerseRange(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
    translation: string = 'kjv'
  ): Promise<BibleResponse> {
    try {
      return await this.fetchFromBibleApi(`${book} ${chapter}:${startVerse}-${endVerse}`, translation);
    } catch (error) {
      console.error('Bible API error:', error);
      throw error;
    }
  }

  /**
   * Generate a song from verse text (returns MP3 audio URL directly)
   * Backend returns binary MP3 synchronously (~12s generation time)
   */
  async generateSong(
    verse: string,
    reference: string,
    style: string = 'gentle worship'
  ): Promise<string> {
    try {
      const url = `${API_BASE_URL}/songs/generate`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verse, reference, style }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate song');
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (Platform.OS === 'web') {
        // Web: btoa is available
        let binary = '';
        const CHUNK = 8192;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode(...(bytes.subarray(i, i + CHUNK) as unknown as number[]));
        }
        return `data:audio/mpeg;base64,${btoa(binary)}`;
      }

      // Native (Android/iOS): btoa is not available — write to a temp file and return file URI
      const base64 = uint8ArrayToBase64(bytes);
      const path = `${FileSystem.cacheDirectory}song_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      return path;
    } catch (error) {
      console.error('Song generation error:', error);
      throw error;
    }
  }

  /**
   * Poll song generation status
   */
  async getSongStatus(jobId: string): Promise<SongStatusResponse> {
    try {
      const url = `${API_BASE_URL}/songs/status/${jobId}`;
      const response = await fetch(url);
      const data: SongStatusResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to check song status');
      }

      return data;
    } catch (error) {
      console.error('Song status error:', error);
      throw error;
    }
  }

  /**
   * Poll for song completion (calls getSongStatus every interval until complete)
   * @param jobId - Job ID from generateSong
   * @param onProgress - Callback for status updates
   * @param interval - Polling interval in ms (default: 3000)
   * @param maxAttempts - Maximum polling attempts (default: 40 = 2 minutes)
   * @returns Audio URL when complete
   */
  async pollSongCompletion(
    jobId: string,
    onProgress?: (status: string) => void,
    interval: number = 3000,
    maxAttempts: number = 40
  ): Promise<string> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusData = await this.getSongStatus(jobId);

      if (onProgress) {
        onProgress(statusData.status || 'unknown');
      }

      if (statusData.status === 'completed' && statusData.audioUrl) {
        return statusData.audioUrl;
      }

      if (statusData.status === 'failed') {
        throw new Error('Song generation failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }

    throw new Error('Song generation timed out');
  }
}

export default new BibleApi();
