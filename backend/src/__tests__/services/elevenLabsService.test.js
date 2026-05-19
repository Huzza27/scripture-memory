// We only test the pure calcDuration function here.
// The rest of elevenLabsService requires live API keys and network calls.

// Load just the function we want to test — pull it from the module without
// triggering any side effects (the module only reads env vars at call time).
jest.mock('axios');
jest.mock('fs');

const { calcDuration } = require('../../services/elevenLabsService');

describe('calcDuration', () => {
  it('returns 25 for an empty/blank string (floor)', () => {
    expect(calcDuration('')).toBe(25);
    expect(calcDuration('   ')).toBe(25);
  });

  it('returns 25 for a single word (floor)', () => {
    // 1 word * 1.5 = 1.5 → rounds to 2 → clamped to 25
    expect(calcDuration('Grace')).toBe(25);
  });

  it('returns 25 for short passages (< 17 words)', () => {
    // 16 words * 1.5 = 24 → clamped to 25
    const text = 'For God so loved the world that he gave his one and only Son that whoever';
    const wordCount = text.trim().split(/\s+/).length;
    expect(wordCount).toBe(16);
    expect(calcDuration(text)).toBe(25);
  });

  it('returns proportional value for mid-range word counts', () => {
    // 20 words * 1.5 = 30 (in range [25,38])
    const words = Array(20).fill('word').join(' ');
    expect(calcDuration(words)).toBe(30);
  });

  it('returns 38 for long passages (ceiling)', () => {
    // 30 words * 1.5 = 45 → clamped to 38
    const words = Array(30).fill('word').join(' ');
    expect(calcDuration(words)).toBe(38);
  });

  it('returns 38 for very long passages', () => {
    const words = Array(100).fill('word').join(' ');
    expect(calcDuration(words)).toBe(38);
  });

  it('rounds to nearest integer', () => {
    // 17 words * 1.5 = 25.5 → rounds to 26
    const words = Array(17).fill('word').join(' ');
    expect(calcDuration(words)).toBe(26);
  });

  it('exact boundary: 17 words = 26s', () => {
    const words = Array(17).fill('word').join(' ');
    expect(calcDuration(words)).toBe(26);
  });

  it('exact boundary: 25 words = 38s (ceiling hit)', () => {
    // 25 * 1.5 = 37.5 → rounds to 38 (at ceiling)
    const words = Array(25).fill('word').join(' ');
    expect(calcDuration(words)).toBe(38);
  });

  it('handles extra whitespace between words', () => {
    // "word  word  word" has 3 words → 3 * 1.5 = 4.5 → 5 → clamped to 25
    expect(calcDuration('word  word  word')).toBe(25);
  });
});
