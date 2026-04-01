# Development Plan — Scripture Memory

**Last Updated:** April 2026
**Current:** Phase 4 in progress

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

### Phase 4 — Memory Testing System ⏳ IN PROGRESS
Full spec: `docs/MEMORY_TESTING_SYSTEM.md`

**Built:**
- ✅ `utils/recallUtils.ts` — tokenizer, first-letter validator, accuracy scorer
- ✅ `app/practice.tsx` — Practice tab with Stage 1 recall (select → practice → result)
- ✅ Word-by-word result breakdown with color coding
- ✅ Shake animation on incorrect answers

**Remaining:**
- [ ] Stage 2: partial word hiding (40–70%)
- [ ] Stage 3: full verse hidden, reference only
- [ ] Stage progression logic (90% accuracy × 2 → advance)
- [ ] Flashcard mode (A + B)
- [ ] Spaced repetition
- [ ] Progress persistence (AsyncStorage)

**Progressive Recall (3 stages):**
- Stage 1: Full verse visible, user types first letter of each word
- Stage 2: 40–70% of words hidden, first-letter input with hints
- Stage 3: Verse fully hidden, reference only shown

**Flashcards:**
- Mode A: Reference → Verse recall
- Mode B: Verse → Reference recall
- Spaced repetition (again/hard/good/easy → 10min/6hr/1day/3day intervals)

**Song Integration:**
- Passive playback during review
- Fill-in-the-lyric mode (audio plays with gap, user inputs first letter)
- Rhythm recall mode

**Scoring:** accuracy = correct_letters / total_words + streaks + speed bonuses

**MVP order:** Stage 1–3 recall → flashcards → basic scoring → song playback → lyric-fill → spaced repetition

---

### Phase 5 — Accounts & Persistence
- User authentication (JWT or Firebase)
- Cloud storage for generated songs
- Progress tracking (memory score, streaks, spaced repetition)

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
| Auth | Deferred to Phase 4 | Not needed for core loop |

---

## Troubleshooting

**Metro bundler module errors:**
Always restart dev server after `npm install`: `npx expo start --clear`
Affected Dec 10, 2025 when adding `@react-native-picker/picker`.
