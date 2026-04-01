// Eleven Labs Music Generation Service
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * Generate a song from verse text using Eleven Labs Music API
 * @param {string} verseText - The Bible verse text
 * @param {string} style - Music style (default: 'gentle worship')
 * @param {number} duration - Song duration in seconds (default: 25)
 * @returns {Promise<Buffer>} - Audio file buffer
 */
async function generateMusic(verseText, style = 'gentle worship', duration = 25) {
  if (!ELEVEN_API_KEY || ELEVEN_API_KEY === 'your_api_key_here') {
    throw new Error('ELEVEN_API_KEY not configured. Please add your API key to .env file.');
  }

  const prompt = `
Create a simple, melodic Christian worship-style song designed to help memorize scripture.

Lyrics to use:
"${verseText}"

Requirements:
- Style: ${style}
- Tempo: 80–100 BPM
- Melody should be repetitive for easy memorization
- Vocals should be clear and easy to follow
  `.trim();

  try {
    const response = await axios.post(
      `${BASE_URL}/music`,
      {
        prompt,
        music_length_ms: duration * 1000,
        model_id: 'music_v1'
      },
      {
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Eleven Labs API Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail?.message ||
      'Failed to generate music. Please check your API key and try again.'
    );
  }
}

/**
 * Check the status of a music generation job
 * @param {string} jobId - The job ID returned from generateMusic
 * @returns {Promise<Object>} - Job status object {status, audio_url}
 */
async function checkJobStatus(jobId) {
  if (!ELEVEN_API_KEY || ELEVEN_API_KEY === 'your_api_key_here') {
    throw new Error('ELEVEN_API_KEY not configured. Please add your API key to .env file.');
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/music/generate/${jobId}`,
      {
        headers: {
          'xi-api-key': ELEVEN_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Eleven Labs Job Status Error:', error.response?.data || error.message);
    throw new Error('Failed to check job status. Please try again.');
  }
}

/**
 * Download audio file from URL
 * @param {string} url - The audio URL from completed job
 * @param {string} filename - Local filename to save
 * @returns {Promise<string>} - Path to saved file
 */
async function downloadAudio(url, filename) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    // Create audio directory if it doesn't exist
    const audioDir = path.join(__dirname, '../../audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const filepath = path.join(audioDir, filename);
    fs.writeFileSync(filepath, Buffer.from(response.data));

    return filepath;
  } catch (error) {
    console.error('Audio Download Error:', error.message);
    throw new Error('Failed to download audio file. Please try again.');
  }
}

module.exports = {
  generateMusic,
  checkJobStatus,
  downloadAudio
};
