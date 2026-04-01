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
 * For Stage 2: deterministically decide which word indices are hidden (~50%).
 * Uses verse id as seed so hiding is consistent across attempts.
 */
export function getHiddenIndices(tokens: string[], verseId: string): Set<number> {
  // Simple deterministic shuffle using verseId chars as seed offsets
  const seed = verseId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hidden = new Set<number>();
  for (let i = 0; i < tokens.length; i++) {
    if ((i * 7 + seed) % 2 === 0) hidden.add(i);
  }
  // Ensure roughly 50% — if too many or too few, adjust
  return hidden;
}
