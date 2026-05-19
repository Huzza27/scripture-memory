# Tasks — Scripture Memory

---

## 🔴 Current Tasks

_No open tasks. See Phase 5 in DEV_PLAN.md for next priorities._

### Completed This Session
- ✅ Wire verse/folder/progress/streak writes to sync endpoints (write-through, fire-and-forget, `storage.ts`)

---

## ✅ Completed Tasks

### Phase 1 — Core Infrastructure
- React Native + Expo SDK 54, Expo Router
- Backend: Node.js + Express + bible-api.com
- Verse search by reference
- Translation picker (KJV, NIV, ESV, NKJV)
- Save/delete verses (AsyncStorage, max 10)
- End-to-end working on phone

### Phase 2 Backend — ElevenLabs Integration (Dec 10, 2025)
- `POST /api/v1/songs/generate` returns MP3 directly
- In-memory cache by `reference:style`
- Synchronous audio response (no job polling)
- Fixed incorrect API assumptions (endpoint, model ID, duration param)

### Docs Cleanup (Mar 2026)
- Deleted `PROJECT_ANALYSIS.md` and `EXPO_SDK_54_SETUP.md`
- Rewrote README, SETUP, DEV_PLAN, API, ELEVENLABS docs
- 88% line reduction (2,882 → ~345 lines)

### Radial FAB Menu (Mar 2026)
Added animated radial menu to the main verses page (`app/index.tsx`):
- `+` FAB opens a spring-animated arc of 3 options: Verse, Passage, New Folder
- Sub-buttons fan out with scale + opacity animation
- FAB moved to bottom-left per UI spec

### Add Verse Flow — Book/Chapter/Verse Picker (Mar 2026)
Replaced search-based verse-add UX with 3-step bottom-sheet modal (`AddVerseModal`):
- Book/Chapter/Verse grids, fully offline navigation
- Single API call only for final verse text fetch

### Web Dev Workflow (Mar 2026)
- Configured `expo start --web --port 8083` for PC-based UI testing

### Folder System (Apr 2026)
Full folder organization system per `UI_SPEC.md`:
- Folders displayed as rows on home screen (above verses, with divider)
- Folder creation via FAB → "New Folder" (name + color picker)
- Folder detail: verse list, add verse (existing with search, or new), remove from folder
- Folder edit (name + color) via long press → context menu
- Folder delete (non-destructive — verses preserved) via long press → context menu
- `folderStorage.updateFolder()` added to `utils/storage.ts`

### Verse Practice Menu (Apr 2026)
Tap a verse on home screen → bottom sheet with:
- **Practice** → opens `verse/[id]` and auto-starts practice (`?autostart=1` param)
- **View Verse** → opens verse detail in view mode
- **Edit** → inline edit sheet for verse text + reference
- **Delete** → confirmation prompt

### Drag-out from Folder Detail Screen (Apr 2026)
Long press verse in `folders/[id].tsx` → haptic + `setPendingDrag(verse, folderId)` → `router.back()`. Home screen shows move-mode banner on focus: "Moving [ref] — tap a folder or Place at Root". `DragContext` (global React context) stores pending verse + source folder ID across screens. Implemented in `context/DragContext.tsx`.

### Drag Mode — Home Screen (Apr 2026)
`VerseCard` component with `PanResponder`: hold 500ms → haptic + drag starts; quick tap → practice menu. Ghost card follows finger. Folders highlight on hover (blue border + `+` icon). Drop on folder → `addVerseToFolder`. Drag cancelled if finger moves >8px before 500ms (scroll-safe). Cross-screen drag (from folder detail) deferred.

### Dynamic Duration Formula (Apr 2026)
`calcDuration(text)` in `elevenLabsService.js`: `Math.min(38, Math.max(25, round(wordCount * 1.5)))`. Songs now scale 25–38s based on passage length. Logged with word count at generation time.

### Radial Menu — Passage destination (Apr 2026)
`AddPassageModal`: Book → Chapter → Start Verse → End Verse (4-step picker), calls `getVerseRange`, saves passage with reference like "Romans 8:1-4". Start verse shown in green on end step; verses before start disabled.

### Folder Flashcard Practice (Apr 2026)
Full flashcard session at `app/flashcards/[id].tsx`:
- "Practice" button in folder detail header
- Shuffled deck; each card randomly Type A (ref → verse) or Type B (verse → ref)
- Tap to flip, Correct/Incorrect buttons advance cards
- Progress bar (folder color), live score strip
- Results screen: grade, %, Shuffle & Retry or Done

### Unit Test Suite (Apr 2026)
Jest test infrastructure added for mobile and backend.

**Mobile** (`mobile/__tests__/utils/`) — `jest-expo` preset, AsyncStorage auto-mock, `Date.now` mock for id uniqueness:
- `recallUtils.test.ts` — 28 tests: tokenize, tokenizeRef, getHiddenIndices, validateFirstLetters, buildAnswer
- `bibleData.test.ts` — 18 tests: OT/NT book lists (counts, structure, uniqueness), VERSE_COUNTS integrity, getVerseCount edge cases
- `storage.test.ts` — 53 tests: full stage/streak/mastered state machine, verse CRUD (max-10 eviction, dedup), folder CRUD, cross-folder operations

**Backend** (`backend/src/__tests__/`) — Jest + supertest, services mocked:
- `services/elevenLabsService.test.js` — 10 tests: calcDuration clamp/round behavior
- `routes/bible.test.js` — 17 tests: verse/chapter/range routes (happy path, validation errors, service errors)

Run: `npm test` in either `mobile/` or `backend/`
Total: **126 tests, all passing**

### 3-Round Practice Flow (Apr 2026)
Individual verse practice (`app/verse/[id].tsx`) now runs all 3 rounds per session:
- Round 1: Full verse visible, type first letter of each word
- Round 2: Partial words hidden
- Round 3: Verse hidden, reference hint only
- Reference check after each round (user types reference, validated against correct value)
- Per-round results: word accuracy % + ref correct/incorrect badge
- Progress recorded against stage based on Round 3 performance
