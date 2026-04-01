// Bible API Client
// Connects to backend Express server

const API_BASE_URL = 'http://192.168.86.126:3000/api/v1';

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

class BibleApi {
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

      // Convert MP3 to base64 data URI (persistent, works on web + native)
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
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
