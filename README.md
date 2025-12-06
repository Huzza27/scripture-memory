# Scripture Memory App

**Bible Verse Memorization with AI Song Generator**

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Version](https://img.shields.io/badge/version-0.1.0-blue)

---

## Overview

Scripture Memory is a mobile app that helps users memorize Bible verses by generating custom melodies and songs from any verse, passage, or chapter. By combining music with scripture, memorization becomes easier, faster, and more engaging.

**Core Concept:**
1. User selects a Bible verse
2. AI generates a custom melody with the verse as lyrics
3. User listens, practices, and memorizes through music

---

## Features

### MVP Features
- **Verse Search:** Search by reference, browse chapters, or paste custom text
- **AI Song Generation:** Converts any verse into a singable melody
- **Audio Player:** Play, pause, loop, adjust tempo, download songs
- **Memorization Tools:** Hide-word mode, flashcards, spaced repetition
- **Progress Tracking:** Streaks, memory scores, review scheduling

### Future Features
- Multiple musical styles (hymn, pop, children's song, etc.)
- Verse-of-the-day songs
- Social sharing
- Offline mode
- Multi-language support

---

## Tech Stack

**Frontend:**
- React Native + Expo
- State: Zustand/Recoil
- UI: React Native Paper

**Backend:**
- Node.js (Express) or Python (FastAPI)
- Database: PostgreSQL/MongoDB
- Storage: AWS S3/Cloudinary

**AI/ML:**
- Custom melody generation algorithm
- Text-to-speech or AI singing synthesis
- Bible API integration (KJV/ESV)

---

## Project Structure

```
scripture-memory/
├── mobile/           # React Native app
├── backend/          # API server
├── docs/             # Documentation
├── DEV_PLAN.md       # Development roadmap
└── README.md         # This file
```

See [DEV_PLAN.md](./DEV_PLAN.md) for full development roadmap.

---

## Getting Started

See [SETUP.md](./docs/SETUP.md) for detailed setup instructions.

### Quick Start

**Prerequisites:**
- Node.js 18+
- npm or yarn
- Expo CLI
- (Backend: Python 3.10+ or Node.js 18+)

**Clone & Install:**
```bash
# Clone repository
git clone <repo-url>
cd scripture-memory

# Install mobile dependencies
cd mobile
npm install

# Install backend dependencies
cd ../backend
npm install  # or: pip install -r requirements.txt
```

**Run Development:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev  # or: python main.py

# Terminal 2: Start mobile app
cd mobile
npx expo start
```

---

## Development Status

**Current Phase:** Phase 1 — Core Infrastructure

See [DEV_PLAN.md](./DEV_PLAN.md) for:
- Detailed feature specifications
- 5-phase development roadmap
- Database schema
- API documentation

---

## Contributing

(Coming soon)

---

## License

(To be determined)

---

## Contact

Project Lead: [Your contact info]

---

**Built with faith, code, and music.**
