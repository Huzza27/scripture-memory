// Bible API Client
// Connects to backend Express server

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

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
   * Fetch a verse by reference (e.g., "John 3:16")
   */
  async getVerse(reference: string, translation: string = 'kjv'): Promise<BibleResponse> {
    try {
      const url = `${API_BASE_URL}/bible/verse/${encodeURIComponent(reference)}?translation=${translation}`;
      const response = await fetch(url);
      const data: BibleResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch verse');
      }

      return data;
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
      const url = `${API_BASE_URL}/bible/chapter/${encodeURIComponent(book)}/${chapter}?translation=${translation}`;
      const response = await fetch(url);
      const data: BibleResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch chapter');
      }

      return data;
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
      const url = `${API_BASE_URL}/bible/range/${encodeURIComponent(book)}/${chapter}/${startVerse}/${endVerse}?translation=${translation}`;
      const response = await fetch(url);
      const data: BibleResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch verse range');
      }

      return data;
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

      // Convert MP3 to base64 data URI — works on both web and native (no FileReader)
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const CHUNK = 8192;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...(bytes.subarray(i, i + CHUNK) as unknown as number[]));
      }
      return `data:audio/mpeg;base64,${btoa(binary)}`;
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
