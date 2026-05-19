# Development Plan — Scripture Memory

**Last Updated:** April 2026
**Current:** Phase 5 in progress

---

## Roadmap

### Phase 1 — Core Infrastructure ✅ COMPLETE
- React Native + Expo SDK 54, Expo Router
- Backend: Node.js + Express + bible-api.com
- Verse search by reference
- Translation picker (KJV, NIV, ESV, NKJV)
- Save/delete verses (AsyncStorage, max 10)
- End-to-end working on phone

---

### Phase 2 — AI Song Generation + Add Verse UX ✅ COMPLETE

**Backend:** ✅ Complete (Dec 10, 2025)
**Add Verse Flow:** ✅ Complete (Mar 2026)
**Song Frontend:** ⏳ Pending

**What's built:**
- `POST /api/v1/songs/generate` → returns MP3 directly (~12s)
- In-memory cache by `reference:style`
- ElevenLabs Music API integration (synchronous, `music_v1` model)
- `components/AddVerseModal` — 3-step book/chapter/verse picker
- `utils/bibleData.ts` — all 66 books with chapter + verse counts (fully offline navigation)
- `generateSong()` wired in `bibleApi.ts` (home screen musical notes button works)

**Complete:**
- ✅ SongPlayer component (play/pause/loop, progress bar, restart)
- ✅ StylePickerModal (gentle worship, hymn, upbeat, chant)
- ✅ expo-av audio playback (web + native)

**Key API facts:**
- Endpoint: `POST https://api.elevenlabs.io/v1/music`
- Model: `music_v1` (exact string required)
- Duration param: `music_length_ms` (milliseconds)
- Response: Synchronous binary MP3 (~12s, ~391KB for 25s)
- Auth header: `xi-api-key`

---

### Phase 3 — Audio Player
- Play/pause/loop controls
- Tempo slider
- Background audio support
- Offline playback

---

### Phase 4 — Memory Testing System ✅ CORE COMPLETE (Apr 2026)
Full spec: `docs/MEMORY_TESTING_SYSTEM.md` | UI spec: `docs/UI_SPEC.md`

**Built:**
- ✅ `utils/recallUtils.ts` — tokenizer, first-letter validator, accuracy scorer
- ✅ `app/verse/[id].tsx` — 3-round session (full → partial → blind), reference check after each round, per-round results
- ✅ `app/flashcards/[id].tsx` — folder flashcard session (Type A + B, flip animation, scoring)
- ✅ `app/practice.tsx` — standalone Practice tab (verse select → first-letter recall → result)
- ✅ Stage progression: 90% accuracy × 2 sessions → advance stage, streak tracking
- ✅ Progress persistence (AsyncStorage via `progressStorage`)
- ✅ Folder system: create, edit, delete, add/remove verses, long-press context menu
- ✅ Verse Practice Menu: tap verse → bottom sheet (Practice / View / Edit / Delete)
- ✅ Word-by-word result breakdown, shake animation on wrong answers

**Also built (Apr 2026):**
- ✅ Drag-to-folder on home screen (`VerseCard` + `PanResponder`, ghost card, hover highlight)
- ✅ `AddPassageModal` — 4-step range picker (Book → Chapter → Start → End verse)
- ✅ Dynamic duration formula — `calcDuration()` scales songs 25–38s by word count

**Also built (Apr 2026):**
- ✅ Unit test suite — 126 tests across mobile + backend (see TASKS.md for details)
  - Mobile: `jest-expo`, tests for `recallUtils`, `bibleData`, `storage` (99 tests)
  - Backend: `jest` + `supertest`, tests for `calcDuration`, `bible` routes (27 tests)
  - Run: `npm test` in `mobile/` or `backend/`

**Remaining:**
- [ ] Spaced repetition intervals (again/hard/good/easy)
- [ ] Song passive playback during review
- [ ] Drag verse out of folder detail screen (cross-screen drag, deferred)

---

### Phase 5 — Accounts & Persistence ✅ CORE COMPLETE (Apr 2026)

**Built:**
- ✅ JWT auth — `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- ✅ Supabase (PostgreSQL) — hosted DB, session pooler, schema applied
- ✅ Sync routes — verses, folders, progress, streak (CRUD + bulk import)
- ✅ `AuthContext` — token persisted via SecureStore (native) / AsyncStorage (web)
- ✅ Auth gate in `_layout.tsx` — redirects to `/login` if not signed in
- ✅ Login/register screen (`app/login.tsx`) — combined screen, toggle between modes
- ✅ First-login migration modal — prompts user to import local verses to account
- ✅ `bibleApi.ts` — `setToken()`, auth headers on all sync calls

**Stack decisions:**
- Auth: JWT (self-contained, no native modules, works with Expo Go)
- DB: Supabase (free hosted Postgres, session pooler for IPv4)
- Web fallback: AsyncStorage instead of SecureStore on web platform

**Remaining:**
- [x] Wire verse/folder/progress/streak writes to sync endpoints — write-through in `storage.ts` via `fireSync()` (Apr 2026)
- [x] Pull cloud data on login — `pullFromCloud()` in `utils/cloudPull.ts`, triggered from `MigrateGate` on login (Apr 2026)
- [ ] Spaced repetition scheduling

---

### Phase 6 — Polish & Release
- UI/UX polish, onboarding
- App Store + Google Play submission
- Backend hosting (Railway/Fly.io)

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Bible API | bible-api.com | Free, multi-translation |
| AI music | ElevenLabs | High vocal quality, simple REST API |
| Storage | AsyncStorage (Phase 1-2) | No backend DB needed yet |
| Auth | JWT + Supabase | No native modules needed, works with Expo Go, free hosted DB |

---

## Troubleshooting

**Metro bundler module errors:**
Always restart dev server after `npm install`: `npx expo start --clear`
Affected Dec 10, 2025 when adding `@react-native-picker/picker`.
