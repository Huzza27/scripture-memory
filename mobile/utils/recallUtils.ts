/**
 * Tokenize a verse into words, stripping punctuation and normalizing to lowercase.
 */
export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z0-9']/g, "").toLowerCase())
    .filter(w => w.length > 0);
}

/**
 * Tokenize a reference like "John 3:16" or "1 Corinthians 13:4"
 * into ["john", "3", "16"] or ["1", "corinthians", "13", "4"].
 * Splits on spaces and colons so chapter/verse are separate tokens.
 */
export function tokenizeRef(ref: string): string[] {
  return ref
    .split(/[\s:]+/)
    .map(w => w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
    .filter(w => w.length > 0);
}

/**
 * For Stage 2: deterministically decide which word indices are hidden (~50%).
 * Uses verse id as seed so hiding is consistent across attempts.
 */
export function getHiddenIndices(tokens: string[], verseId: string): Set<number> {
  const seed = verseId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hidden = new Set<number>();
  for (let i = 0; i < tokens.length; i++) {
    if ((i * 7 + seed) % 2 === 0) hidden.add(i);
  }
  return hidden;
}

/**
 * Validate user's first-letter input against tokens.
 * Input is space-separated letters (e.g. "f g s l t w").
 */
export function validateFirstLetters(
  tokens: string[],
  input: string
): { results: boolean[]; accuracy: number } {
  const letters = input.trim().toLowerCase().split(/\s+/);
  const results = tokens.map((token, i) => {
    const expected = token[0] ?? "";
    const actual = letters[i] ?? "";
    return expected.length > 0 && actual === expected;
  });
  const accuracy = tokens.length > 0 ? results.filter(Boolean).length / tokens.length : 0;
  return { results, accuracy };
}

/**
 * Build the expected answer string (first letter of each token, space-separated).
 */
export function buildAnswer(tokens: string[]): string {
  return tokens.map(t => t[0] ?? "").join(" ");
}
