// Bible API Routes
const express = require('express');
const router = express.Router();
const { param, query, validationResult } = require('express-validator');
const bibleService = require('../services/bibleService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: errors.array()
      }
    });
  }
  next();
};

// GET /api/v1/bible/verse/:reference
// Example: /api/v1/bible/verse/John%203:16
router.get('/verse/:reference', [
  param('reference').trim().notEmpty().withMessage('Reference is required'),
  query('translation').optional().trim().isAlpha().withMessage('Translation must contain only letters'),
  validate
], async (req, res) => {
  try {
    const { reference } = req.params;
    const { translation } = req.query;

    const verse = await bibleService.getVerse(reference, translation);

    res.json({
      success: true,
      data: verse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VERSE_FETCH_ERROR',
        message: error.message
      }
    });
  }
});

// GET /api/v1/bible/chapter/:book/:chapter
// Example: /api/v1/bible/chapter/John/3
router.get('/chapter/:book/:chapter', [
  param('book').trim().notEmpty().withMessage('Book is required'),
  param('chapter').isInt({ min: 1 }).withMessage('Chapter must be a positive number'),
  query('translation').optional().trim().isAlpha().withMessage('Translation must contain only letters'),
  validate
], async (req, res) => {
  try {
    const { book, chapter } = req.params;
    const { translation } = req.query;

    const chapterData = await bibleService.getChapter(book, parseInt(chapter), translation);

    res.json({
      success: true,
      data: chapterData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'CHAPTER_FETCH_ERROR',
        message: error.message
      }
    });
  }
});

// GET /api/v1/bible/range/:book/:chapter/:start/:end
// Example: /api/v1/bible/range/John/3/16/17
router.get('/range/:book/:chapter/:start/:end', [
  param('book').trim().notEmpty().withMessage('Book is required'),
  param('chapter').isInt({ min: 1 }).withMessage('Chapter must be a positive number'),
  param('start').isInt({ min: 1 }).withMessage('Start verse must be a positive number'),
  param('end').isInt({ min: 1 }).withMessage('End verse must be a positive number'),
  query('translation').optional().trim().isAlpha().withMessage('Translation must contain only letters'),
  validate
], async (req, res) => {
  try {
    const { book, chapter, start, end } = req.params;
    const { translation } = req.query;

    const verses = await bibleService.getVerseRange(
      book,
      parseInt(chapter),
      parseInt(start),
      parseInt(end),
      translation
    );

    res.json({
      success: true,
      data: verses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'RANGE_FETCH_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;
