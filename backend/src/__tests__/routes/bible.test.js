const request = require('supertest');
const express = require('express');

// Mock bibleService before requiring the routes that import it
jest.mock('../../services/bibleService', () => ({
  getVerse: jest.fn(),
  getChapter: jest.fn(),
  getVerseRange: jest.fn(),
}));

const bibleService = require('../../services/bibleService');
const bibleRoutes = require('../../routes/bible');

// Build a minimal test app — avoids starting the full server with listen()
const app = express();
app.use(express.json());
app.use('/', bibleRoutes);

// ── GET /verse/:reference ─────────────────────────────────────────────────────

describe('GET /verse/:reference', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 and verse data on success', async () => {
    const mockVerse = {
      reference: 'John 3:16',
      text: 'For God so loved the world...',
      translation: 'KJV',
    };
    bibleService.getVerse.mockResolvedValue(mockVerse);

    const res = await request(app).get('/verse/John%203:16');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockVerse);
    expect(bibleService.getVerse).toHaveBeenCalledWith('John 3:16', undefined);
  });

  it('passes translation query param to service', async () => {
    bibleService.getVerse.mockResolvedValue({ reference: 'John 3:16' });

    await request(app).get('/verse/John%203:16?translation=kjv');

    expect(bibleService.getVerse).toHaveBeenCalledWith('John 3:16', 'kjv');
  });

  it('returns 400 when service throws', async () => {
    bibleService.getVerse.mockRejectedValue(new Error('Verse not found'));

    const res = await request(app).get('/verse/NotAVerse');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VERSE_FETCH_ERROR');
    expect(res.body.error.message).toBe('Verse not found');
  });

  it('returns 400 validation error for empty reference', async () => {
    const res = await request(app).get('/verse/%20');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 validation error for non-alpha translation param', async () => {
    bibleService.getVerse.mockResolvedValue({});
    const res = await request(app).get('/verse/John%203:16?translation=kj123');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ── GET /chapter/:book/:chapter ───────────────────────────────────────────────

describe('GET /chapter/:book/:chapter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 and chapter data on success', async () => {
    const mockChapter = { book: 'John', chapter: 3, verses: [] };
    bibleService.getChapter.mockResolvedValue(mockChapter);

    const res = await request(app).get('/chapter/John/3');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockChapter);
    expect(bibleService.getChapter).toHaveBeenCalledWith('John', 3, undefined);
  });

  it('passes translation query param to service', async () => {
    bibleService.getChapter.mockResolvedValue({});
    await request(app).get('/chapter/John/3?translation=esv');
    expect(bibleService.getChapter).toHaveBeenCalledWith('John', 3, 'esv');
  });

  it('returns 400 for chapter = 0', async () => {
    const res = await request(app).get('/chapter/John/0');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for negative chapter', async () => {
    const res = await request(app).get('/chapter/John/-1');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for non-numeric chapter', async () => {
    const res = await request(app).get('/chapter/John/abc');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when service throws', async () => {
    bibleService.getChapter.mockRejectedValue(new Error('Chapter not found'));
    const res = await request(app).get('/chapter/Fake/1');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CHAPTER_FETCH_ERROR');
  });
});

// ── GET /range/:book/:chapter/:start/:end ─────────────────────────────────────

describe('GET /range/:book/:chapter/:start/:end', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 and range data on success', async () => {
    const mockRange = { book: 'Romans', chapter: 8, verses: [{ verse: 1 }, { verse: 2 }] };
    bibleService.getVerseRange.mockResolvedValue(mockRange);

    const res = await request(app).get('/range/Romans/8/1/4');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockRange);
    expect(bibleService.getVerseRange).toHaveBeenCalledWith('Romans', 8, 1, 4, undefined);
  });

  it('passes translation query param to service', async () => {
    bibleService.getVerseRange.mockResolvedValue({});
    await request(app).get('/range/Romans/8/1/4?translation=niv');
    expect(bibleService.getVerseRange).toHaveBeenCalledWith('Romans', 8, 1, 4, 'niv');
  });

  it('returns 400 when start verse is 0', async () => {
    const res = await request(app).get('/range/John/3/0/5');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when end verse is 0', async () => {
    const res = await request(app).get('/range/John/3/1/0');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for non-numeric start verse', async () => {
    const res = await request(app).get('/range/John/3/a/5');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when service throws', async () => {
    bibleService.getVerseRange.mockRejectedValue(new Error('Range error'));
    const res = await request(app).get('/range/John/3/1/5');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('RANGE_FETCH_ERROR');
  });
});
