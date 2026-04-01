// Bible API Service
// Uses bible-api.com for KJV verse lookups
const axios = require('axios');

const BASE_URL = 'https://bible-api.com';
const DEFAULT_TRANSLATION = 'kjv';

class BibleService {
  /**
   * Get verse by reference (e.g., "John 3:16", "Genesis 1:1-3")
   * @param {string} reference - Bible verse reference
   * @param {string} translation - Bible translation (default: kjv)
   * @returns {Promise<Object>} Verse data
   */
  async getVerse(reference, translation = DEFAULT_TRANSLATION) {
    try {
      const url = `${BASE_URL}/${encodeURIComponent(reference)}?translation=${translation}`;
      const response = await axios.get(url);

      return {
        reference: response.data.reference,
        verses: response.data.verses,
        text: response.data.text,
        translation: response.data.translation_id || translation,
        translationName: response.data.translation_name
      };
    } catch (error) {
      console.error('Bible API error:', error.message);
      throw new Error(`Failed to fetch verse: ${reference}`);
    }
  }

  /**
   * Get entire chapter
   * @param {string} book - Book name (e.g., "John", "Genesis")
   * @param {number} chapter - Chapter number
   * @param {string} translation - Bible translation
   * @returns {Promise<Object>} Chapter data
   */
  async getChapter(book, chapter, translation = DEFAULT_TRANSLATION) {
    const reference = `${book} ${chapter}`;
    return this.getVerse(reference, translation);
  }

  /**
   * Get verse range
   * @param {string} book - Book name
   * @param {number} chapter - Chapter number
   * @param {number} startVerse - Starting verse
   * @param {number} endVerse - Ending verse
   * @param {string} translation - Bible translation
   * @returns {Promise<Object>} Verses data
   */
  async getVerseRange(book, chapter, startVerse, endVerse, translation = DEFAULT_TRANSLATION) {
    const reference = `${book} ${chapter}:${startVerse}-${endVerse}`;
    return this.getVerse(reference, translation);
  }

  /**
   * Search verses (simple text search in fetched verses)
   * Note: For production, consider using a more robust search API
   * @param {string} query - Search term
   * @returns {Promise<Array>} Search results
   */
  async searchVerses(query) {
    // This is a placeholder - bible-api.com doesn't have search
    // In production, you'd use an API with search capabilities or local DB
    throw new Error('Search not yet implemented - use specific references');
  }
}

module.exports = new BibleService();
