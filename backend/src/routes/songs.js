// Song Generation Routes
const express = require('express');
const router = express.Router();
const elevenLabsService = require('../services/elevenLabsService');

// In-memory cache for generated songs (replace with database later)
const songCache = new Map();

/**
 * POST /api/v1/songs/generate
 * Generate a new song from verse text
 *
 * Request body:
 * {
 *   verse: "For God so loved the world...",
 *   reference: "John 3:16",
 *   style: "gentle worship" (optional)
 * }
 *
 * Response:
 * Binary audio file (MP3)
 */
router.post('/generate', async (req, res) => {
  const { verse, reference, style } = req.body;

  // Validation
  if (!verse || !reference) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Both verse and reference are required'
      }
    });
  }

  // Check cache first (avoid regenerating same verse)
  const cacheKey = `${reference}:${style || 'default'}`;
  if (songCache.has(cacheKey)) {
    const cached = songCache.get(cacheKey);
    console.log(`📦 Cache hit for ${reference}`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${reference.replace(/[^a-zA-Z0-9]/g, '_')}.mp3"`);
    return res.send(cached.audioBuffer);
  }

  try {
    console.log(`🎵 Generating song for ${reference}...`);
    const audioBuffer = await elevenLabsService.generateMusic(
      verse,
      style || 'gentle worship',
      25 // duration in seconds
    );

    // Store in cache
    songCache.set(cacheKey, {
      audioBuffer,
      reference,
      verse,
      style: style || 'gentle worship',
      createdAt: new Date().toISOString()
    });

    console.log(`✅ Song generated successfully for ${reference}`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${reference.replace(/[^a-zA-Z0-9]/g, '_')}.mp3"`);
    res.send(audioBuffer);
  } catch (error) {
    console.error('Song generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: error.message
      }
    });
  }
});

/**
 * GET /api/v1/songs/status/:jobId
 * Check the status of a song generation job
 *
 * Response (queued/generating):
 * {
 *   success: true,
 *   status: "generating",
 *   jobId: "abc123..."
 * }
 *
 * Response (completed):
 * {
 *   success: true,
 *   status: "completed",
 *   jobId: "abc123...",
 *   audioUrl: "https://cdn.elevenlabs.io/.../track.mp3"
 * }
 */
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_JOB_ID',
        message: 'Job ID is required'
      }
    });
  }

  try {
    const jobStatus = await elevenLabsService.checkJobStatus(jobId);

    res.json({
      success: true,
      status: jobStatus.status,
      jobId,
      audioUrl: jobStatus.audio_url || null,
      message: jobStatus.status === 'completed'
        ? 'Song generation complete'
        : `Song is ${jobStatus.status}`
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_CHECK_FAILED',
        message: error.message
      }
    });
  }
});

/**
 * GET /api/v1/songs/cache
 * Get all cached songs (for debugging)
 */
router.get('/cache', (req, res) => {
  const cached = Array.from(songCache.entries()).map(([key, value]) => ({
    key,
    ...value
  }));

  res.json({
    success: true,
    count: cached.length,
    songs: cached
  });
});

/**
 * DELETE /api/v1/songs/cache/:reference
 * Clear cache for a specific verse (for debugging)
 */
router.delete('/cache/:reference', (req, res) => {
  const { reference } = req.params;
  const deleted = [];

  // Delete all cache entries for this reference
  for (const [key, value] of songCache.entries()) {
    if (value.reference === reference) {
      songCache.delete(key);
      deleted.push(key);
    }
  }

  res.json({
    success: true,
    message: `Cleared ${deleted.length} cache entries for ${reference}`,
    deleted
  });
});

module.exports = router;
