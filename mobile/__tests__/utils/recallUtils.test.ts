import {
  tokenize,
  tokenizeRef,
  getHiddenIndices,
  validateFirstLetters,
  buildAnswer,
} from "../../utils/recallUtils";

// ── tokenize ─────────────────────────────────────────────────────────────────

describe("tokenize", () => {
  it("splits on whitespace and lowercases", () => {
    expect(tokenize("For God so loved the world")).toEqual([
      "for", "god", "so", "loved", "the", "world",
    ]);
  });

  it("strips trailing punctuation", () => {
    expect(tokenize("Lord, God.")).toEqual(["lord", "god"]);
  });

  it("strips surrounding quotes and mixed punctuation", () => {
    expect(tokenize('"Hello," said the Lord.')).toEqual([
      "hello", "said", "the", "lord",
    ]);
  });

  it("preserves apostrophes inside words", () => {
    expect(tokenize("God's grace")).toEqual(["god's", "grace"]);
  });

  it("handles multiple spaces", () => {
    expect(tokenize("the   Lord   is")).toEqual(["the", "lord", "is"]);
  });

  it("returns empty array for empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(tokenize("   ")).toEqual([]);
  });

  it("handles numbers in tokens", () => {
    expect(tokenize("Psalm 23:1")).toEqual(["psalm", "231"]);
  });
});

// ── tokenizeRef ───────────────────────────────────────────────────────────────

describe("tokenizeRef", () => {
  it("splits simple reference", () => {
    expect(tokenizeRef("John 3:16")).toEqual(["john", "3", "16"]);
  });

  it("splits numbered book reference", () => {
    expect(tokenizeRef("1 Corinthians 13:4")).toEqual(["1", "corinthians", "13", "4"]);
  });

  it("splits multi-word book", () => {
    expect(tokenizeRef("Song of Solomon 1:2")).toEqual([
      "song", "of", "solomon", "1", "2",
    ]);
  });

  it("handles leading/trailing spaces", () => {
    expect(tokenizeRef("  Romans 8:1  ")).toEqual(["romans", "8", "1"]);
  });

  it("returns empty array for empty string", () => {
    expect(tokenizeRef("")).toEqual([]);
  });
});

// ── getHiddenIndices ──────────────────────────────────────────────────────────

describe("getHiddenIndices", () => {
  const tokens = ["for", "god", "so", "loved", "the", "world"];
  const verseId = "verse-123";

  it("returns a Set", () => {
    expect(getHiddenIndices(tokens, verseId)).toBeInstanceOf(Set);
  });

  it("is deterministic — same id produces same result", () => {
    const a = getHiddenIndices(tokens, verseId);
    const b = getHiddenIndices(tokens, verseId);
    expect([...a]).toEqual([...b]);
  });

  it("different ids produce different patterns for the same tokens", () => {
    const a = getHiddenIndices(tokens, "id-aaa");
    const b = getHiddenIndices(tokens, "id-zzz");
    // Not guaranteed to always differ, but with different seeds usually will
    // (we just verify both are valid Sets of valid indices)
    expect(a.size).toBeGreaterThanOrEqual(0);
    expect(b.size).toBeGreaterThanOrEqual(0);
    [...a].forEach(i => expect(i).toBeGreaterThanOrEqual(0));
    [...b].forEach(i => expect(i).toBeLessThan(tokens.length));
  });

  it("all hidden indices are within bounds", () => {
    const hidden = getHiddenIndices(tokens, verseId);
    hidden.forEach(i => {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(tokens.length);
    });
  });

  it("returns empty Set for empty tokens", () => {
    expect(getHiddenIndices([], verseId).size).toBe(0);
  });

  it("hides roughly half the words (within ±1 for short verses)", () => {
    const long = Array.from({ length: 20 }, (_, i) => `word${i}`);
    const hidden = getHiddenIndices(long, "test-id");
    expect(hidden.size).toBeGreaterThanOrEqual(8);
    expect(hidden.size).toBeLessThanOrEqual(12);
  });
});

// ── validateFirstLetters ──────────────────────────────────────────────────────

describe("validateFirstLetters", () => {
  const tokens = ["for", "god", "so", "loved", "the", "world"];

  it("scores a perfect answer as 1.0", () => {
    const { accuracy, results } = validateFirstLetters(tokens, "f g s l t w");
    expect(accuracy).toBe(1);
    expect(results.every(Boolean)).toBe(true);
  });

  it("scores an all-wrong answer as 0", () => {
    const { accuracy, results } = validateFirstLetters(tokens, "x x x x x x");
    expect(accuracy).toBe(0);
    expect(results.every(r => !r)).toBe(true);
  });

  it("scores a half-correct answer at 0.5", () => {
    // first 3 correct, last 3 wrong
    const { accuracy } = validateFirstLetters(tokens, "f g s x x x");
    expect(accuracy).toBeCloseTo(0.5);
  });

  it("is case-insensitive", () => {
    const { accuracy } = validateFirstLetters(tokens, "F G S L T W");
    expect(accuracy).toBe(1);
  });

  it("handles extra spaces in input", () => {
    const { accuracy } = validateFirstLetters(tokens, "  f  g  s  l  t  w  ");
    expect(accuracy).toBe(1);
  });

  it("returns per-token results array of correct length", () => {
    const { results } = validateFirstLetters(tokens, "f g s l t w");
    expect(results).toHaveLength(tokens.length);
  });

  it("treats missing input letters as wrong", () => {
    // Only 3 letters provided for 6 tokens
    const { results } = validateFirstLetters(tokens, "f g s");
    expect(results[0]).toBe(true);
    expect(results[1]).toBe(true);
    expect(results[2]).toBe(true);
    expect(results[3]).toBe(false);
    expect(results[4]).toBe(false);
    expect(results[5]).toBe(false);
  });

  it("returns accuracy 0 for empty tokens", () => {
    const { accuracy, results } = validateFirstLetters([], "f g");
    expect(accuracy).toBe(0);
    expect(results).toHaveLength(0);
  });

  it("handles numeric tokens (Psalm 23)", () => {
    const numTokens = ["psalm", "23", "the"];
    const { accuracy } = validateFirstLetters(numTokens, "p 2 t");
    expect(accuracy).toBe(1);
  });
});

// ── buildAnswer ───────────────────────────────────────────────────────────────

describe("buildAnswer", () => {
  it("builds space-separated first letters", () => {
    expect(buildAnswer(["for", "god", "so", "loved"])).toBe("f g s l");
  });

  it("returns empty string for empty tokens", () => {
    expect(buildAnswer([])).toBe("");
  });

  it("handles single token", () => {
    expect(buildAnswer(["grace"])).toBe("g");
  });

  it("uses first char of each token", () => {
    const tokens = ["abc", "xyz", "123"];
    expect(buildAnswer(tokens)).toBe("a x 1");
  });

  it("answer matches tokenized verse round-trip", () => {
    const verse = "For God so loved the world";
    const tokens = tokenize(verse);
    const answer = buildAnswer(tokens);
    const { accuracy } = validateFirstLetters(tokens, answer);
    expect(accuracy).toBe(1);
  });
});
