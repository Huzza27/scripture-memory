import AsyncStorage from "@react-native-async-storage/async-storage";
import { progressStorage, verseStorage, folderStorage, streakStorage, FOLDER_COLORS, FOLDER_COLOR_DEFAULT } from "../../utils/storage";

// AsyncStorage is auto-mocked via jest moduleNameMapper → async-storage-mock

// saveVerse/createFolder use Date.now() for ids. Rapid calls within the same
// millisecond produce duplicate ids and break multi-item tests. Use an
// incrementing mock so every call gets a unique id.
let mockTime = 1000;
beforeEach(async () => {
  mockTime = 1000;
  jest.spyOn(Date, 'now').mockImplementation(() => mockTime++);
  await AsyncStorage.clear();
});
afterEach(() => jest.restoreAllMocks());

// ── progressStorage.recordAttempt ─────────────────────────────────────────────

describe("progressStorage.recordAttempt", () => {
  const id = "verse-001";

  it("creates initial progress on first attempt", async () => {
    const { progress } = await progressStorage.recordAttempt(id, 0.8);
    expect(progress.verseId).toBe(id);
    expect(progress.stage).toBe(1);
    expect(progress.attempts).toBe(1);
    expect(progress.mastered).toBe(false);
  });

  it("increments attempts on each call", async () => {
    await progressStorage.recordAttempt(id, 0.5);
    await progressStorage.recordAttempt(id, 0.5);
    const { progress } = await progressStorage.recordAttempt(id, 0.5);
    expect(progress.attempts).toBe(3);
  });

  it("increments streak on accuracy >= 90%", async () => {
    const { progress } = await progressStorage.recordAttempt(id, 0.95);
    expect(progress.streak).toBe(1);
  });

  it("resets streak on accuracy < 90%", async () => {
    await progressStorage.recordAttempt(id, 1.0); // streak = 1
    const { progress } = await progressStorage.recordAttempt(id, 0.5); // streak reset
    expect(progress.streak).toBe(0);
  });

  it("does NOT advance stage until streak reaches 2", async () => {
    const { advanced } = await progressStorage.recordAttempt(id, 1.0);
    expect(advanced).toBe(false);
  });

  it("advances stage 1→2 after streak of 2 high-accuracy attempts", async () => {
    await progressStorage.recordAttempt(id, 1.0); // streak 1
    const { advanced, progress } = await progressStorage.recordAttempt(id, 1.0); // streak 2
    expect(advanced).toBe(true);
    expect(progress.stage).toBe(2);
  });

  it("resets streak to 0 after advancing", async () => {
    await progressStorage.recordAttempt(id, 1.0);
    const { progress } = await progressStorage.recordAttempt(id, 1.0);
    expect(progress.streak).toBe(0);
  });

  it("advances stage 2→3 after another streak of 2", async () => {
    // Get to stage 2
    await progressStorage.recordAttempt(id, 1.0);
    await progressStorage.recordAttempt(id, 1.0);
    // Now advance from stage 2
    await progressStorage.recordAttempt(id, 1.0);
    const { advanced, progress } = await progressStorage.recordAttempt(id, 1.0);
    expect(advanced).toBe(true);
    expect(progress.stage).toBe(3);
  });

  it("marks mastered after streak of 2 at stage 3", async () => {
    // Get to stage 3: two streaks of 2
    await progressStorage.recordAttempt(id, 1.0);
    await progressStorage.recordAttempt(id, 1.0); // → stage 2
    await progressStorage.recordAttempt(id, 1.0);
    await progressStorage.recordAttempt(id, 1.0); // → stage 3
    // Now master it
    await progressStorage.recordAttempt(id, 1.0);
    const { mastered, progress } = await progressStorage.recordAttempt(id, 1.0);
    expect(mastered).toBe(true);
    expect(progress.mastered).toBe(true);
  });

  it("does not advance stage once mastered", async () => {
    // Get to mastered state
    for (let i = 0; i < 6; i++) {
      await progressStorage.recordAttempt(id, 1.0);
    }
    // Additional attempts on a mastered verse
    const { advanced, progress } = await progressStorage.recordAttempt(id, 1.0);
    expect(advanced).toBe(false);
    expect(progress.mastered).toBe(true);
  });

  it("keeps only the last 2 accuracies in recentAccuracies", async () => {
    await progressStorage.recordAttempt(id, 0.5);
    await progressStorage.recordAttempt(id, 0.7);
    const { progress } = await progressStorage.recordAttempt(id, 0.9);
    expect(progress.recentAccuracies).toHaveLength(2);
    expect(progress.recentAccuracies).toEqual([0.7, 0.9]);
  });

  it("persists progress across calls (reads from AsyncStorage)", async () => {
    await progressStorage.recordAttempt(id, 1.0);
    const stored = await progressStorage.get(id);
    expect(stored?.attempts).toBe(1);
    expect(stored?.streak).toBe(1);
  });

  it("exact threshold: 0.9 counts as high-accuracy", async () => {
    const { progress } = await progressStorage.recordAttempt(id, 0.9);
    expect(progress.streak).toBe(1);
  });

  it("just below threshold: 0.89 resets streak", async () => {
    await progressStorage.recordAttempt(id, 1.0); // streak 1
    const { progress } = await progressStorage.recordAttempt(id, 0.89);
    expect(progress.streak).toBe(0);
  });
});

// ── progressStorage.reset ─────────────────────────────────────────────────────

describe("progressStorage.reset", () => {
  it("removes progress for the given verse", async () => {
    await progressStorage.recordAttempt("v1", 1.0);
    await progressStorage.reset("v1");
    const result = await progressStorage.get("v1");
    expect(result).toBeNull();
  });

  it("does not affect other verses", async () => {
    await progressStorage.recordAttempt("v1", 1.0);
    await progressStorage.recordAttempt("v2", 0.5);
    await progressStorage.reset("v1");
    const v2 = await progressStorage.get("v2");
    expect(v2).not.toBeNull();
  });
});

// ── verseStorage ──────────────────────────────────────────────────────────────

const makeVerse = (ref: string) => ({
  reference: ref,
  text: `Text for ${ref}`,
  translation: "KJV",
});

describe("verseStorage.getSavedVerses", () => {
  it("returns empty array when nothing saved", async () => {
    const verses = await verseStorage.getSavedVerses();
    expect(verses).toEqual([]);
  });
});

describe("verseStorage.saveVerse", () => {
  it("saves a verse and retrieves it", async () => {
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    const verses = await verseStorage.getSavedVerses();
    expect(verses).toHaveLength(1);
    expect(verses[0].reference).toBe("John 3:16");
  });

  it("assigns an id and savedAt timestamp", async () => {
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    const [verse] = await verseStorage.getSavedVerses();
    expect(verse.id).toBeTruthy();
    expect(verse.savedAt).toBeTruthy();
  });

  it("prepends new verses (most recent first)", async () => {
    await verseStorage.saveVerse(makeVerse("Gen 1:1"));
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    const verses = await verseStorage.getSavedVerses();
    expect(verses[0].reference).toBe("John 3:16");
    expect(verses[1].reference).toBe("Gen 1:1");
  });

  it("does not save duplicates (same reference)", async () => {
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    const verses = await verseStorage.getSavedVerses();
    expect(verses).toHaveLength(1);
  });

  it("enforces max of 10 verses (drops oldest)", async () => {
    for (let i = 1; i <= 11; i++) {
      await verseStorage.saveVerse(makeVerse(`Ps ${i}:1`));
    }
    const verses = await verseStorage.getSavedVerses();
    expect(verses).toHaveLength(10);
    // Oldest (Ps 1:1) should have been evicted
    expect(verses.find(v => v.reference === "Ps 1:1")).toBeUndefined();
  });
});

describe("verseStorage.deleteVerse", () => {
  it("removes verse by id", async () => {
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    const [verse] = await verseStorage.getSavedVerses();
    await verseStorage.deleteVerse(verse.id);
    const verses = await verseStorage.getSavedVerses();
    expect(verses).toHaveLength(0);
  });

  it("does not affect other verses", async () => {
    await verseStorage.saveVerse(makeVerse("Gen 1:1"));
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    const verses = await verseStorage.getSavedVerses();
    await verseStorage.deleteVerse(verses[1].id); // delete Gen 1:1
    const remaining = await verseStorage.getSavedVerses();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].reference).toBe("John 3:16");
  });
});

describe("verseStorage.updateVerse", () => {
  it("updates specified fields only", async () => {
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    const [verse] = await verseStorage.getSavedVerses();
    await verseStorage.updateVerse(verse.id, { songUri: "file://song.mp3" });
    const [updated] = await verseStorage.getSavedVerses();
    expect(updated.songUri).toBe("file://song.mp3");
    expect(updated.reference).toBe("John 3:16"); // unchanged
  });
});

describe("verseStorage.clearAll", () => {
  it("removes all saved verses", async () => {
    await verseStorage.saveVerse(makeVerse("John 3:16"));
    await verseStorage.saveVerse(makeVerse("Gen 1:1"));
    await verseStorage.clearAll();
    const verses = await verseStorage.getSavedVerses();
    expect(verses).toHaveLength(0);
  });
});

// ── folderStorage ─────────────────────────────────────────────────────────────

describe("folderStorage", () => {
  it("starts with no folders", async () => {
    const folders = await folderStorage.getFolders();
    expect(folders).toEqual([]);
  });

  it("creates a folder with id, name, color, createdAt, verseIds", async () => {
    const folder = await folderStorage.createFolder("Faith", "#3b82f6");
    expect(folder.name).toBe("Faith");
    expect(folder.color).toBe("#3b82f6");
    expect(folder.id).toBeTruthy();
    expect(folder.verseIds).toEqual([]);
  });

  it("persists created folders", async () => {
    await folderStorage.createFolder("Hope", "#22c55e");
    const folders = await folderStorage.getFolders();
    expect(folders).toHaveLength(1);
    expect(folders[0].name).toBe("Hope");
  });

  it("deletes a folder by id", async () => {
    const folder = await folderStorage.createFolder("Temp", "#64748b");
    await folderStorage.deleteFolder(folder.id);
    const folders = await folderStorage.getFolders();
    expect(folders).toHaveLength(0);
  });

  it("updates folder name and color", async () => {
    const folder = await folderStorage.createFolder("Old", "#64748b");
    await folderStorage.updateFolder(folder.id, { name: "New", color: "#ef4444" });
    const folders = await folderStorage.getFolders();
    expect(folders[0].name).toBe("New");
    expect(folders[0].color).toBe("#ef4444");
  });

  it("adds a verse to a folder", async () => {
    const folder = await folderStorage.createFolder("Grace", "#3b82f6");
    await folderStorage.addVerseToFolder(folder.id, "verse-abc");
    const folders = await folderStorage.getFolders();
    expect(folders[0].verseIds).toContain("verse-abc");
  });

  it("does not add duplicate verseIds", async () => {
    const folder = await folderStorage.createFolder("Grace", "#3b82f6");
    await folderStorage.addVerseToFolder(folder.id, "verse-abc");
    await folderStorage.addVerseToFolder(folder.id, "verse-abc");
    const folders = await folderStorage.getFolders();
    expect(folders[0].verseIds.filter(id => id === "verse-abc")).toHaveLength(1);
  });

  it("removes a verse from a folder", async () => {
    const folder = await folderStorage.createFolder("Grace", "#3b82f6");
    await folderStorage.addVerseToFolder(folder.id, "verse-abc");
    await folderStorage.removeVerseFromFolder(folder.id, "verse-abc");
    const folders = await folderStorage.getFolders();
    expect(folders[0].verseIds).not.toContain("verse-abc");
  });

  it("removeVerseFromAllFolders removes from every folder", async () => {
    const f1 = await folderStorage.createFolder("A", "#3b82f6");
    const f2 = await folderStorage.createFolder("B", "#ef4444");
    await folderStorage.addVerseToFolder(f1.id, "verse-x");
    await folderStorage.addVerseToFolder(f2.id, "verse-x");
    await folderStorage.removeVerseFromAllFolders("verse-x");
    const folders = await folderStorage.getFolders();
    folders.forEach(f => expect(f.verseIds).not.toContain("verse-x"));
  });

  it("getFoldersForVerse returns only folders containing the verse", async () => {
    const f1 = await folderStorage.createFolder("A", "#3b82f6");
    const f2 = await folderStorage.createFolder("B", "#ef4444");
    await folderStorage.addVerseToFolder(f1.id, "verse-y");
    // verse-y is only in f1, not f2
    const result = await folderStorage.getFoldersForVerse("verse-y");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(f1.id);
    expect(result.find(f => f.id === f2.id)).toBeUndefined();
  });

  it("getFoldersForVerse returns empty when verse is in no folder", async () => {
    await folderStorage.createFolder("A", "#3b82f6");
    const result = await folderStorage.getFoldersForVerse("no-folder-verse");
    expect(result).toHaveLength(0);
  });
});

// ── FOLDER_COLORS constant ────────────────────────────────────────────────────

describe("FOLDER_COLORS", () => {
  it("has 8 colors", () => {
    expect(FOLDER_COLORS).toHaveLength(8);
  });

  it("default color is first in the list", () => {
    expect(FOLDER_COLORS[0]).toBe(FOLDER_COLOR_DEFAULT);
  });

  it("all colors are valid hex strings", () => {
    FOLDER_COLORS.forEach(c => {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

// ── SRS / nextReview ──────────────────────────────────────────────────────────

describe("progressStorage SRS fields", () => {
  const id = "srs-verse";

  it("sets nextReview and intervalDays on first attempt (fail)", async () => {
    const { progress } = await progressStorage.recordAttempt(id, 0.5);
    expect(progress.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(progress.intervalDays).toBe(1);
  });

  it("sets intervalDays=1 on passing stage-1 attempt", async () => {
    const { progress } = await progressStorage.recordAttempt(id, 0.95);
    expect(progress.intervalDays).toBe(1);
  });

  it("sets intervalDays=3 when at stage 2", async () => {
    // Advance to stage 2
    await progressStorage.recordAttempt(id, 1.0);
    await progressStorage.recordAttempt(id, 1.0); // → stage 2, streak reset
    const { progress } = await progressStorage.recordAttempt(id, 1.0);
    expect(progress.stage).toBe(2);
    expect(progress.intervalDays).toBe(3);
  });

  it("sets intervalDays=7 when at stage 3", async () => {
    // Advance to stage 3
    await progressStorage.recordAttempt(id, 1.0);
    await progressStorage.recordAttempt(id, 1.0); // → stage 2
    await progressStorage.recordAttempt(id, 1.0);
    await progressStorage.recordAttempt(id, 1.0); // → stage 3
    const { progress } = await progressStorage.recordAttempt(id, 1.0);
    expect(progress.stage).toBe(3);
    expect(progress.intervalDays).toBe(7);
  });

  it("sets intervalDays=30 when mastered", async () => {
    for (let i = 0; i < 5; i++) await progressStorage.recordAttempt(id, 1.0);
    const { progress } = await progressStorage.recordAttempt(id, 1.0); // → mastered
    expect(progress.mastered).toBe(true);
    expect(progress.intervalDays).toBe(30);
  });

  it("sets intervalDays=1 on a fail regardless of stage", async () => {
    // Advance to stage 2 first
    await progressStorage.recordAttempt(id, 1.0);
    await progressStorage.recordAttempt(id, 1.0); // → stage 2
    const { progress } = await progressStorage.recordAttempt(id, 0.5); // fail
    expect(progress.intervalDays).toBe(1);
  });

  it("nextReview is in the future", async () => {
    const { progress } = await progressStorage.recordAttempt(id, 0.95);
    const today = new Date().toISOString().split('T')[0];
    expect(progress.nextReview > today).toBe(true);
  });
});

describe("progressStorage.getDueVerseIds", () => {
  it("returns empty array when no progress recorded", async () => {
    const due = await progressStorage.getDueVerseIds();
    expect(due).toEqual([]);
  });

  it("does not return a verse that was just practiced", async () => {
    await progressStorage.recordAttempt("v1", 1.0);
    const due = await progressStorage.getDueVerseIds();
    expect(due).not.toContain("v1");
  });
});

// ── streakStorage ─────────────────────────────────────────────────────────────

describe("streakStorage", () => {
  it("returns zero streak with no history", async () => {
    const s = await streakStorage.get();
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
    expect(s.totalDays).toBe(0);
  });

  it("starts streak at 1 on first practice", async () => {
    const s = await streakStorage.recordPracticeDay();
    expect(s.currentStreak).toBe(1);
    expect(s.totalDays).toBe(1);
  });

  it("does not double-count the same day", async () => {
    await streakStorage.recordPracticeDay();
    const s = await streakStorage.recordPracticeDay();
    expect(s.currentStreak).toBe(1);
    expect(s.totalDays).toBe(1);
  });

  it("updates longestStreak", async () => {
    const s = await streakStorage.recordPracticeDay();
    expect(s.longestStreak).toBe(1);
  });

  it("records practice via recordAttempt (integration)", async () => {
    await progressStorage.recordAttempt("streak-verse", 0.95);
    const s = await streakStorage.get();
    expect(s.currentStreak).toBe(1);
    expect(s.totalDays).toBe(1);
  });
});
