# Tasks — Scripture Memory

---

## 🔴 Current Tasks

### Dynamic Duration Formula
Fixed 25s duration cuts off lyrics for longer passages. Implement a formula that calculates `music_length_ms` based on passage word/character count so every verse fits naturally.
- Rule of thumb: ~1.5–2s per word as a starting estimate
- Test against short (John 11:35), medium (Proverbs 3:5-6), and long (1 Peter 5:2-3) passages

### Radial Menu — Passage and Folder destinations
Verse is now wired. Remaining:
- **Passage** → multi-verse range input screen (currently routes to `/search` as placeholder)
- **Folder** → folder creation/management screen (not yet designed)

### Phase 2 Frontend — AI Song Generation
Wire up song generation to the UI. See `ELEVENLABS_INTEGRATION.md` for backend details.
- [ ] Add `generateSong()` to `mobile/api/bibleApi.ts`
- [ ] Loading state UI (~12s wait)
- [ ] Save MP3 to device (Expo FileSystem)
- [ ] Audio playback component (play/pause/loop)
- [ ] Style presets UI (gentle worship, hymn, upbeat, chant)

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
- `+` FAB at bottom-right opens a spring-animated arc of 3 options: Verse, Passage, Folder
- `+` rotates to `×` when open
- Sub-buttons fan out (up, diagonal, up-left) with scale + opacity animation
- Labels appear as frosted pills to the left of each button
- Key bug fixed: `fabContainer` must be last in JSX render order or it gets covered by the list/empty state and taps are swallowed

### Add Verse Flow — Book/Chapter/Verse Picker (Mar 2026)
Replaced the old search-based verse-add UX with a 3-step bottom-sheet modal (`AddVerseModal`):
- **Book step**: grid of 66 square buttons (OT/NT sections) with abbreviated names
- **Chapter step**: instant grid from hardcoded chapter counts (no API call)
- **Verse step**: instant grid from hardcoded verse counts per chapter (1,189 values in `utils/bibleData.ts`)
- On verse tap: single `getVerse()` API call fetches text → auto-saves to AsyncStorage → modal closes
- Wired to the "Verse" radial FAB option in `app/index.tsx`

Key design decision: all navigation is offline/instant. The API is only hit for the final verse text fetch, avoiding the previous hang caused by pre-fetching entire chapters through the backend.

### Web Dev Workflow (Mar 2026)
- Configured `expo start --web --port 8083` for PC-based UI testing
- Chrome DevTools mobile simulation (F12 → Ctrl+Shift+M) replaces phone-only testing
