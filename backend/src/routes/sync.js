const express = require('express');
const { body } = require('express-validator');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(requireAuth);

// ── Validation rules ──────────────────────────────────────────────────────────

const verseRules = [
  body('id').isString().trim().notEmpty().withMessage('id is required'),
  body('reference').isString().trim().notEmpty().withMessage('reference is required').isLength({ max: 200 }),
  body('text').isString().trim().notEmpty().withMessage('text is required').isLength({ max: 10000 }),
  body('translation').optional().isString().isLength({ max: 20 }),
  body('songUri').optional({ nullable: true }).isString(),
  body('songStyle').optional({ nullable: true }).isString().isLength({ max: 100 }),
];

const bulkVersesRules = [
  body('verses').isArray().withMessage('verses must be an array'),
  body('verses.*.id').isString().notEmpty().withMessage('each verse must have an id'),
  body('verses.*.reference').isString().notEmpty().withMessage('each verse must have a reference'),
  body('verses.*.text').isString().notEmpty().withMessage('each verse must have text'),
];

const folderRules = [
  body('id').isString().trim().notEmpty().withMessage('id is required'),
  body('name').isString().trim().notEmpty().withMessage('name is required').isLength({ max: 100 }),
  body('color').optional().isString().isLength({ max: 20 }),
  body('verseIds').optional().isArray().withMessage('verseIds must be an array'),
];

const bulkFoldersRules = [
  body('folders').isArray().withMessage('folders must be an array'),
  body('folders.*.id').isString().notEmpty().withMessage('each folder must have an id'),
  body('folders.*.name').isString().notEmpty().withMessage('each folder must have a name'),
];

const progressRules = [
  body('stage').optional().isInt({ min: 1, max: 3 }).withMessage('stage must be 1, 2, or 3'),
  body('streak').optional().isInt({ min: 0 }),
  body('attempts').optional().isInt({ min: 0 }),
  body('mastered').optional().isBoolean(),
  body('recentAccuracies').optional().isArray(),
];

const streakRules = [
  body('currentStreak').optional().isInt({ min: 0 }),
  body('longestStreak').optional().isInt({ min: 0 }),
  body('totalDays').optional().isInt({ min: 0 }),
  body('lastPracticeDate').optional({ nullable: true }).isString(),
];

// ── Verses ────────────────────────────────────────────────────────────────────

// GET /api/v1/sync/verses
router.get('/verses', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, reference, text, translation, song_uri, song_style, created_at FROM saved_verses WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json({ verses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch verses' } });
  }
});

// POST /api/v1/sync/verses  — upsert a single verse
router.post('/verses', verseRules, validate, async (req, res) => {
  const { id, reference, text, translation, songUri, songStyle, createdAt } = req.body;
  try {
    const result = await query(
      `INSERT INTO saved_verses (id, user_id, reference, text, translation, song_uri, song_style, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         reference = EXCLUDED.reference, text = EXCLUDED.text, translation = EXCLUDED.translation,
         song_uri = EXCLUDED.song_uri, song_style = EXCLUDED.song_style
       RETURNING *`,
      [id, req.user.id, reference, text, translation || 'KJV', songUri || null, songStyle || null, createdAt || new Date()]
    );
    res.status(201).json({ verse: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to save verse' } });
  }
});

// DELETE /api/v1/sync/verses/:id
router.delete('/verses/:id', async (req, res) => {
  try {
    await query('DELETE FROM saved_verses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to delete verse' } });
  }
});

// POST /api/v1/sync/verses/bulk — import all local verses at once (first login migration)
router.post('/verses/bulk', bulkVersesRules, validate, async (req, res) => {
  const { verses } = req.body;
  try {
    for (const v of verses) {
      await query(
        `INSERT INTO saved_verses (id, user_id, reference, text, translation, song_uri, song_style, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [v.id, req.user.id, v.reference, v.text, v.translation || 'KJV', v.songUri || null, v.songStyle || null, v.createdAt || new Date()]
      );
    }
    res.json({ imported: verses.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Bulk import failed' } });
  }
});

// ── Folders ───────────────────────────────────────────────────────────────────

// GET /api/v1/sync/folders
router.get('/folders', async (req, res) => {
  try {
    const fResult = await query(
      'SELECT id, name, color, created_at FROM folders WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    const folders = fResult.rows;
    if (folders.length === 0) return res.json({ folders: [] });

    const folderIds = folders.map(f => f.id);
    const vResult = await query(
      'SELECT folder_id, verse_id FROM folder_verses WHERE folder_id = ANY($1)',
      [folderIds]
    );
    const verseMap = {};
    for (const row of vResult.rows) {
      if (!verseMap[row.folder_id]) verseMap[row.folder_id] = [];
      verseMap[row.folder_id].push(row.verse_id);
    }
    res.json({ folders: folders.map(f => ({ ...f, verseIds: verseMap[f.id] || [] })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch folders' } });
  }
});

// POST /api/v1/sync/folders — upsert folder
router.post('/folders', folderRules, validate, async (req, res) => {
  const { id, name, color, createdAt, verseIds } = req.body;
  try {
    await query(
      `INSERT INTO folders (id, user_id, name, color, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color`,
      [id, req.user.id, name, color || '#64748b', createdAt || new Date()]
    );
    if (Array.isArray(verseIds)) {
      await query('DELETE FROM folder_verses WHERE folder_id = $1', [id]);
      for (const vid of verseIds) {
        await query(
          'INSERT INTO folder_verses (folder_id, verse_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, vid]
        );
      }
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to save folder' } });
  }
});

// DELETE /api/v1/sync/folders/:id
router.delete('/folders/:id', async (req, res) => {
  try {
    await query('DELETE FROM folders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to delete folder' } });
  }
});

// POST /api/v1/sync/folders/bulk
router.post('/folders/bulk', bulkFoldersRules, validate, async (req, res) => {
  const { folders } = req.body;
  try {
    for (const f of folders) {
      await query(
        `INSERT INTO folders (id, user_id, name, color, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, req.user.id, f.name, f.color || '#64748b', f.createdAt || new Date()]
      );
      for (const vid of (f.verseIds || [])) {
        await query(
          'INSERT INTO folder_verses (folder_id, verse_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [f.id, vid]
        );
      }
    }
    res.json({ imported: folders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Bulk folder import failed' } });
  }
});

// ── Progress ──────────────────────────────────────────────────────────────────

// GET /api/v1/sync/progress
router.get('/progress', async (req, res) => {
  try {
    const result = await query(
      'SELECT verse_id, stage, recent_accuracies, streak, attempts, last_attempt, mastered, next_review, interval_days FROM verse_progress WHERE user_id = $1',
      [req.user.id]
    );
    const progressMap = {};
    for (const row of result.rows) {
      progressMap[row.verse_id] = {
        verseId: row.verse_id,
        stage: row.stage,
        recentAccuracies: row.recent_accuracies || [],
        streak: row.streak,
        attempts: row.attempts,
        lastAttempt: row.last_attempt,
        mastered: row.mastered,
        nextReview: row.next_review,
        intervalDays: row.interval_days,
      };
    }
    res.json({ progress: progressMap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch progress' } });
  }
});

// POST /api/v1/sync/progress/:verseId — upsert progress for one verse
router.post('/progress/:verseId', progressRules, validate, async (req, res) => {
  const { verseId } = req.params;
  const { stage, recentAccuracies, streak, attempts, lastAttempt, mastered, nextReview, intervalDays } = req.body;
  try {
    await query(
      `INSERT INTO verse_progress (verse_id, user_id, stage, recent_accuracies, streak, attempts, last_attempt, mastered, next_review, interval_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (verse_id, user_id) DO UPDATE SET
         stage = EXCLUDED.stage, recent_accuracies = EXCLUDED.recent_accuracies,
         streak = EXCLUDED.streak, attempts = EXCLUDED.attempts, last_attempt = EXCLUDED.last_attempt,
         mastered = EXCLUDED.mastered, next_review = EXCLUDED.next_review, interval_days = EXCLUDED.interval_days`,
      [verseId, req.user.id, stage || 1, JSON.stringify(recentAccuracies || []),
       streak || 0, attempts || 0, lastAttempt || null, mastered || false, nextReview || null, intervalDays || 1]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to save progress' } });
  }
});

// GET /api/v1/sync/streak
router.get('/streak', async (req, res) => {
  try {
    const result = await query('SELECT * FROM practice_streak WHERE user_id = $1', [req.user.id]);
    const row = result.rows[0];
    if (!row) return res.json({ streak: null });
    res.json({
      streak: {
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
        lastPracticeDate: row.last_practice_date,
        totalDays: row.total_days,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch streak' } });
  }
});

// POST /api/v1/sync/streak
router.post('/streak', streakRules, validate, async (req, res) => {
  const { currentStreak, longestStreak, lastPracticeDate, totalDays } = req.body;
  try {
    await query(
      `INSERT INTO practice_streak (user_id, current_streak, longest_streak, last_practice_date, total_days, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         current_streak = EXCLUDED.current_streak, longest_streak = EXCLUDED.longest_streak,
         last_practice_date = EXCLUDED.last_practice_date, total_days = EXCLUDED.total_days, updated_at = NOW()`,
      [req.user.id, currentStreak || 0, longestStreak || 0, lastPracticeDate || null, totalDays || 0]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to save streak' } });
  }
});

module.exports = router;
