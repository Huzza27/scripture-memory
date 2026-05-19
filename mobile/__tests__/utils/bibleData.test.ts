import { OT_BOOKS, NT_BOOKS, VERSE_COUNTS, getVerseCount } from "../../utils/bibleData";

// ── Book lists ────────────────────────────────────────────────────────────────

describe("OT_BOOKS", () => {
  it("has 39 books", () => {
    expect(OT_BOOKS).toHaveLength(39);
  });

  it("starts with Genesis", () => {
    expect(OT_BOOKS[0].full).toBe("Genesis");
    expect(OT_BOOKS[0].abbr).toBe("Gen");
  });

  it("ends with Malachi", () => {
    expect(OT_BOOKS[38].full).toBe("Malachi");
    expect(OT_BOOKS[38].abbr).toBe("Mal");
  });

  it("every book has a positive chapter count", () => {
    OT_BOOKS.forEach(b => {
      expect(b.chapters).toBeGreaterThan(0);
    });
  });

  it("Psalms has 150 chapters", () => {
    const psalms = OT_BOOKS.find(b => b.full === "Psalms");
    expect(psalms?.chapters).toBe(150);
  });

  it("every book has non-empty full name and abbreviation", () => {
    OT_BOOKS.forEach(b => {
      expect(b.full.length).toBeGreaterThan(0);
      expect(b.abbr.length).toBeGreaterThan(0);
    });
  });
});

describe("NT_BOOKS", () => {
  it("has 27 books", () => {
    expect(NT_BOOKS).toHaveLength(27);
  });

  it("starts with Matthew", () => {
    expect(NT_BOOKS[0].full).toBe("Matthew");
    expect(NT_BOOKS[0].abbr).toBe("Mat");
  });

  it("ends with Revelation", () => {
    expect(NT_BOOKS[26].full).toBe("Revelation");
    expect(NT_BOOKS[26].abbr).toBe("Rev");
  });

  it("every book has a positive chapter count", () => {
    NT_BOOKS.forEach(b => {
      expect(b.chapters).toBeGreaterThan(0);
    });
  });

  it("John has 21 chapters", () => {
    const john = NT_BOOKS.find(b => b.full === "John");
    expect(john?.chapters).toBe(21);
  });
});

describe("OT_BOOKS + NT_BOOKS combined", () => {
  it("total 66 books", () => {
    expect(OT_BOOKS.length + NT_BOOKS.length).toBe(66);
  });

  it("no duplicate abbreviations", () => {
    const all = [...OT_BOOKS, ...NT_BOOKS];
    const abbrs = all.map(b => b.abbr);
    const unique = new Set(abbrs);
    expect(unique.size).toBe(66);
  });

  it("no duplicate full names", () => {
    const all = [...OT_BOOKS, ...NT_BOOKS];
    const names = all.map(b => b.full);
    const unique = new Set(names);
    expect(unique.size).toBe(66);
  });
});

// ── VERSE_COUNTS ──────────────────────────────────────────────────────────────

describe("VERSE_COUNTS", () => {
  it("has entries for all 66 books", () => {
    const allBooks = [...OT_BOOKS, ...NT_BOOKS].map(b => b.full);
    allBooks.forEach(name => {
      expect(VERSE_COUNTS).toHaveProperty(name);
    });
  });

  it("each book entry length matches its chapter count", () => {
    const allBooks = [...OT_BOOKS, ...NT_BOOKS];
    allBooks.forEach(b => {
      expect(VERSE_COUNTS[b.full]).toHaveLength(b.chapters);
    });
  });

  it("Genesis chapter 1 has 31 verses", () => {
    expect(VERSE_COUNTS["Genesis"][0]).toBe(31);
  });

  it("John chapter 3 has 36 verses", () => {
    expect(VERSE_COUNTS["John"][2]).toBe(36);
  });

  it("all verse counts are positive integers", () => {
    Object.values(VERSE_COUNTS).forEach(chapters => {
      chapters.forEach(count => {
        expect(count).toBeGreaterThan(0);
        expect(Number.isInteger(count)).toBe(true);
      });
    });
  });
});

// ── getVerseCount ─────────────────────────────────────────────────────────────

describe("getVerseCount", () => {
  it("returns correct count for Genesis 1", () => {
    expect(getVerseCount("Genesis", 1)).toBe(31);
  });

  it("returns correct count for John 3", () => {
    expect(getVerseCount("John", 3)).toBe(36);
  });

  it("returns correct count for Psalms 119 (longest chapter)", () => {
    expect(getVerseCount("Psalms", 119)).toBe(176);
  });

  it("returns correct count for Revelation 22 (last chapter)", () => {
    expect(getVerseCount("Revelation", 22)).toBe(21);
  });

  it("returns 30 as fallback for unknown book", () => {
    expect(getVerseCount("NotABook", 1)).toBe(30);
  });

  it("returns 30 as fallback for out-of-range chapter", () => {
    // Genesis only has 50 chapters
    expect(getVerseCount("Genesis", 999)).toBe(30);
  });

  it("returns 30 as fallback for chapter 0", () => {
    // chapter 0 → index -1 → undefined → fallback
    expect(getVerseCount("Genesis", 0)).toBe(30);
  });
});
