# Development Plan — Scripture Memory

**Last Updated:** June 2026
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

### Android Compatibility Audit & Fixes ✅ COMPLETE (Jun 2026)
### Reanimated Migration ✅ PARTIAL (Jun 2026)
Full audit doc: `docs/ANDROID_FIXES.md`

Root cause: app was developed and tested on web (Expo web), creating a systematic bias toward web APIs and layout patterns.

**Critical fixes:**
- ✅ `btoa()` crash on song generation — replaced with `uint8ArrayToBase64()` helper; native writes MP3 to `expo-file-system` cache, returns file URI
- ✅ Dev auth bypass removed — `AuthContext` now initializes with `loading: true` and reads from SecureStore
- ✅ Gluestack `.web.tsx` verified — Metro correctly excludes it from native builds (no code change needed)

**High fixes:**
- ✅ `maxHeight` on animated sheets — replaced with explicit `height` on `VerseContextMenu`, `FolderPickerModal`, `FolderContextMenu`
- ✅ `Dimensions.get()` stale values — replaced with `useWindowDimensions()` in all 3 sheet components
- ✅ `SafeAreaView` insufficient — replaced with `useSafeAreaInsets()` in `BookPickerModal`, `AddVerseModal`
- ✅ Animated backdrop swallowing touches — separated `TouchableOpacity` (always-on touch area) from `Animated.View` with `pointerEvents="none"` in all 3 sheet components
- ✅ `KeyboardAvoidingView` unhandled on Android — changed `undefined` → `'height'` in `login.tsx` and `account.tsx`

**Medium/low fixes:**
- ✅ Hardcoded colors (8 files) — `SongPlayer`, `StylePickerModal`, `TranslationPicker`, `folders.tsx`, `search.tsx`, `stats.tsx`, `BookPickerModal`, `practice.tsx` all migrated to `useTheme()`
- ✅ `useNativeDriver: true` → `Platform.OS !== 'web'` across 8 animated files
- ✅ `scrollIndicatorInsets={{ right: 1 }}` added to FlatLists in `practice.tsx`, `stats.tsx`
- ✅ `text-[9px]` / `text-[10px]` Tailwind classes converted to explicit `style` props

---

### Phase 4B — Topographical Scheduling ✅ COMPLETE (Jun 2026)
Full spec: topographical memorization system where verses move Daily → Weekly → Monthly over time.

**Built:**
- ✅ `VerseStage` type + `MoveSuggestion` interface added to `SavedVerse`
- ✅ New fields: `stage`, `addedToDailyAt/Weekly/Monthly`, `scheduledDayOfWeek`, `scheduledDayOfMonth`, `moveSuggestion`
- ✅ Lazy migration in `getSavedVerses()` — existing verses default to `stage: "daily"`
- ✅ `verseStorage.getVersesDueToday()` — shows daily + weekly/monthly verses due today
- ✅ `checkMoveSuggestions()` — suggests Weekly after 60 days Daily, Monthly after 60 days Weekly
- ✅ `moveToStage()` + `dismissMoveSuggestion()` — accept/dismiss stage moves
- ✅ `MoveSuggestionBanner` component — "Ready to Progress" card with Accept/Dismiss
- ✅ `StagePickerModal` — single day-of-week (7 buttons) or day-of-month (1–31 grid) picker
- ✅ Home screen "Due Today" section replaces legacy schedule filter
- ✅ `VerseCard` shows Weekly/Monthly stage label (e.g. "Weekly · Mon", "Monthly · 15th")
- ✅ `VerseContextMenu` — removed legacy Frequency picker (replaced by stage system)

**Android bug fixes (Jun 2026):**
- `PracticePickerSheet` rewritten — dropped custom `Animated.spring` (silently fails on Android Modal mount), replaced with `animationType="slide"` + `flex justifyContent="flex-end"` layout
- `folders/[id].tsx` — `useFocusEffect(load)` passing async fn directly (returns Promise); wrapped correctly
- `verse/[id].tsx` — hidden `TextInput` used `opacity-0` which blocks Android soft keyboard; changed to off-screen positioning

**Reanimated migration (Jun 2026):**
- Upgraded `react-native-reanimated` 4.1.1 → 4.3.0, `react-native-worklets` 0.9.2 → 0.8.3 (version matrix for RN 0.81.5)
- First native Android binary built via `npx expo run:android` (required for Reanimated TurboModule)
- `JAVA_HOME` + `ANDROID_HOME` set permanently in Windows user env
- Login screen archived (`app/_archive/login.tsx`), `AuthGate` removed from `_layout.tsx` — auth bypassed for dev
- `app/index.tsx` calendar section migrated — `FadeInDown`/`FadeOutUp` for expand/collapse
- `components/RadialFAB.tsx` rewritten — Reanimated, radial arc layout, safe area fix, invisible dismiss layer
- `components/VerseContextMenu.tsx` migrated — removed premature `return null` that broke close animation
- Remaining: `practice.tsx`, `verse/[id].tsx`, `SkeletonCard.tsx`, `FolderContextMenu.tsx`, `FolderPickerModal.tsx`
- Full migration notes: `docs/ANDROID_FIXES.md` → Reanimated Migration section

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
