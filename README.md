# Scripture Memory

Bible verse memorization app — AI generates worship songs from verses to aid memorization.

**Status:** v0.1.0 | Phase 1 ✅ Complete | Phase 2 (AI songs) in progress

---

## Tech Stack

**Frontend:** React Native + Expo SDK 54, Expo Router, TypeScript
**Backend:** Node.js + Express (port 3000)
**Storage:** AsyncStorage (local, max 10 verses)
**AI:** ElevenLabs Music API (song generation)
**Bible Data:** bible-api.com (KJV, NIV, ESV, NKJV)

---

## What Works Now

- Add verse via book/chapter/verse picker (3-step bottom-sheet modal, fully offline navigation)
- Search verses by reference (e.g. "John 3:16") via Search tab
- Translation picker (KJV, NIV, ESV, NKJV)
- Save up to 10 verses (AsyncStorage)
- Delete saved verses
- Radial FAB menu on home screen (Verse, Passage, Folder)
- Backend generates AI worship songs via ElevenLabs (~12s, MP3)

---

## Project Structure

```
scripture-memory/
├── mobile/                  # React Native app (Expo SDK 54)
│   ├── app/                 # Screens (Expo Router)
│   ├── api/                 # API client (bibleApi.ts)
│   ├── components/          # AddVerseModal, TranslationPicker
│   └── utils/               # storage.ts, preferences.ts, bibleData.ts
├── backend/                 # Node.js + Express API
│   └── src/
│       ├── routes/          # bible.js, songs.js
│       └── services/        # bibleService.js, elevenLabsService.js
└── docs/                    # Documentation
```

---

## Docs

- [SETUP.md](./docs/SETUP.md) — Run the app locally
- [DEV_PLAN.md](./docs/DEV_PLAN.md) — Roadmap
- [API.md](./docs/API.md) — Backend API reference
- [ELEVENLABS_INTEGRATION.md](./docs/ELEVENLABS_INTEGRATION.md) — Song generation details
