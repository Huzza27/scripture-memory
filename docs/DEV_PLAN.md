# Scripture Memory App — Development Plan
**Bible Verse Memorization with AI Song Generator**

Version: 1.0
Created: December 6, 2025
Status: Planning Phase

---

## 1. Project Summary

Build a mobile app that helps users memorize Bible verses by generating custom melodies/songs from any verse, passage, or chapter.

**Core Concept:**
- User inputs text (verse/passage/chapter)
- AI transforms it into a singable melody with lyrics (the verse itself)
- Result: easier, faster memorization through music

**Core Features:**
- Verse search & selection
- AI-generated melodies
- Audio playback + download
- Review tools for memorization
- Progress tracking

---

## 2. Core Features (MVP)

### 2.1 Verse/Passage Input

**User Actions:**
- Type/paste a verse manually
- Search by reference (e.g., "John 3:16")
- Select from a full chapter
- Browse book → chapter → verse

**Bible API Integration:**
- ESV, NIV, KJV, or public domain sources
- **Recommended:** KJV (free, public domain)
- Instant lookup and retrieval

### 2.2 AI Song Generator

**Processing Pipeline:**
1. Converts text → structured lyric lines
2. Generates melody + rhythm pattern
3. Converts melody into audio (singing or hum/synth voice)

**Outputs:**
- Full song (~15–45 seconds)
- Loopable version
- Optional: Harmony or style presets (MVP: simple tune)

**MVP Constraints:**
- Simple melody generation (scale-based)
- Single voice/instrument
- Basic rhythm patterns

### 2.3 Audio Player

**Core Controls:**
- Play/pause/loop
- Adjust tempo (speed control)
- Download or save to user library
- "Practice mode" with slowed playback

**User Experience:**
- Clean, minimal interface
- Waveform visualization (optional)
- Quick access to saved songs

### 2.4 Memorization Tools

**Practice Modes:**
- **Hide-word mode:** Fill-in-the-blank with selective word hiding
- **Flashcards:** Front (reference) / Back (verse)
- **Daily review schedule:** Spaced repetition algorithm
- **Verse streak tracking:** Consecutive days reviewed

**Progress Metrics:**
- Memory score (0–100)
- Review frequency
- Mastery level per verse

---

## 3. Tech Stack

### 3.1 Frontend
- **Framework:** React Native (mobile-first)
- **Build Tool:** Expo (easy iOS/Android builds)
- **State Management:** Zustand or Recoil
- **UI Library:** React Native Paper or NativeBase

### 3.2 Backend
- **Server:** Node.js (Express) or Python (FastAPI)
- **Database:** PostgreSQL or MongoDB
- **File Storage:** AWS S3 or Cloudinary (audio files)
- **Authentication:** JWT or Firebase Auth

### 3.3 API Integrations
- **Bible API:** Bible API, ESV API, or Scripture API
- **AI Song Generation:** Custom or third-party
- **Audio Synthesis:** Text-to-Speech or music generation API

### 3.4 AI Layer

**Components Required:**

1. **Text → Melody Generator**
   - LLM to structure verse into rhythmic chunks
   - Simple melody algorithm (scale-based randomization + constraints)
   - Optional: Music ML model (MusicGen, Chirp, Suno API)

2. **Melody → Audio Synthesis**
   - AI singing model (Suno, Meta MusicGen w/ vocals)
   - Fallback: Hummed/synth lead instrument
   - MIDI → WAV/MP3 conversion

3. **Style Presets (Stretch Goal)**
   - Pop, hymn, children's song, chant, etc.
   - Genre-specific melody patterns

---

## 4. Data Model (MVP)

### User
```
id                : UUID (primary key)
email             : string (unique)
password_hash     : string
created_at        : timestamp
```

### SavedSong
```
id                : UUID (primary key)
user_id           : UUID (foreign key → User)
verse_reference   : string (e.g., "John 3:16")
full_text         : text
audio_url         : string (S3/Cloudinary URL)
melody_data       : JSON (notes, rhythm, tempo)
created_at        : timestamp
```

### MemorizationProgress
```
id                : UUID (primary key)
user_id           : UUID (foreign key → User)
verse_reference   : string
last_reviewed     : timestamp
memory_score      : integer (0–100)
streak            : integer (days)
total_reviews     : integer
```

---

## 5. Development Roadmap

### PHASE 1 — Core Infrastructure
**Goal:** Set up foundational architecture

**Tasks:**
- [ ] Initialize React Native + Expo project
- [ ] Set up backend (Node.js/FastAPI)
- [ ] Configure database (PostgreSQL/MongoDB)
- [ ] Integrate KJV Bible API (free)
- [ ] Build UI components:
  - [ ] Search bar
  - [ ] Verse lookup screen
  - [ ] Chapter selection UI
  - [ ] Book/chapter/verse browser

**Deliverable:** Working verse search and display

---

### PHASE 2 — AI Song Generator
**Goal:** Core AI melody generation pipeline

**Tasks:**
- [ ] Design prompt system:
  - [ ] Break verse text into lyrical lines
  - [ ] Identify rhythm patterns (syllable counting)
  - [ ] Structure for singability
- [ ] Build melody creation logic:
  - [ ] Choose scale (major/minor)
  - [ ] Generate note patterns (constrained randomization)
  - [ ] Convert to MIDI-like JSON format
- [ ] Integrate audio synthesis:
  - [ ] Feed text + melody into AI singing model
  - [ ] OR use fallback instrumental/hummed version
- [ ] Build API endpoint:
  - [ ] `POST /generate_song`
  - [ ] Input: verse text + preferences
  - [ ] Output: audio file + melody metadata

**Deliverable:** Working song generation from any verse

---

### PHASE 3 — Playback + User Features
**Goal:** Interactive audio player and practice tools

**Tasks:**
- [ ] Build audio player UI:
  - [ ] Play/pause/loop controls
  - [ ] Tempo slider
  - [ ] Progress bar
- [ ] Implement save functionality:
  - [ ] Save song to user library
  - [ ] Associate with user account
- [ ] Build practice tools:
  - [ ] Loop sections of song
  - [ ] Slow playback mode
  - [ ] Word-hide memorization mode (fill-in-the-blank)
- [ ] Add playback features:
  - [ ] Background audio support
  - [ ] Offline playback

**Deliverable:** Fully functional player and practice mode

---

### PHASE 4 — Storage & Accounts
**Goal:** User authentication and data persistence

**Tasks:**
- [ ] Implement user authentication:
  - [ ] Sign up / Sign in
  - [ ] JWT or Firebase Auth
  - [ ] Password reset flow
- [ ] Build user library:
  - [ ] Display saved songs
  - [ ] Delete/rename songs
- [ ] Add download functionality:
  - [ ] Download to device
  - [ ] Offline access
- [ ] Build progress tracking:
  - [ ] Track reviews per verse
  - [ ] Calculate memory score
  - [ ] Display streak counter
  - [ ] Spaced repetition scheduling

**Deliverable:** Full user account system with persistence

---

### PHASE 5 — UI Polish & Release
**Goal:** Production-ready app for app stores

**Tasks:**
- [ ] Design clean, minimalist theme:
  - [ ] Consistent color palette
  - [ ] Typography system
  - [ ] Icon set
- [ ] Build onboarding screens:
  - [ ] Welcome tutorial
  - [ ] Feature highlights
  - [ ] Permission requests
- [ ] Add optional features:
  - [ ] Verse-of-the-day song
  - [ ] Sharing functionality
  - [ ] In-app feedback
- [ ] Testing:
  - [ ] Unit tests for core logic
  - [ ] Integration tests for API
  - [ ] User acceptance testing
- [ ] Deploy:
  - [ ] Build iOS version (TestFlight → App Store)
  - [ ] Build Android version (Google Play)
  - [ ] Set up backend hosting (AWS/Heroku/Railway)

**Deliverable:** Live app on iOS and Android app stores

---

## 6. Key Considerations

### 6.1 Bible API Selection
**Options:**
- **Bible API** (bible-api.com) — Free, KJV only
- **ESV API** (api.esv.org) — Free tier available, high quality
- **Scripture API** (scripture.api.bible) — Multiple translations

**Recommendation:** Start with free KJV, add ESV later

### 6.2 AI Music Generation Options

**Option 1: Custom Algorithm (Recommended for MVP)**
- Pros: Full control, no API costs, fast
- Cons: Limited quality, simple melodies only
- Approach: Scale-based note generation + rhythm patterns

**Option 2: Third-Party API (Suno, MusicGen)**
- Pros: High-quality output, realistic singing
- Cons: API costs, latency, dependency
- Approach: Send text + melody prompt, receive audio

**Option 3: Hybrid Approach**
- Custom melody generation
- Third-party vocal synthesis
- Best balance of cost and quality

### 6.3 Monetization Strategy (Future)
- Free tier: 5 songs/month
- Premium: Unlimited songs, style presets, offline mode
- One-time purchase or subscription model

### 6.4 Legal Considerations
- Bible text: Use public domain (KJV) or licensed APIs
- Music generation: Ensure AI model licensing permits commercial use
- User data: GDPR/CCPA compliance for user accounts

---

## 7. Success Metrics

**MVP Launch Goals:**
- 100 active users in first month
- Average 3 verses memorized per user
- 70% user retention after 1 week

**Long-Term Goals:**
- 10,000+ users
- 4.5+ star rating on app stores
- 50% of users upgrade to premium

---

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI music quality too low | High | Use hybrid approach with manual tuning |
| Bible API rate limits | Medium | Cache common verses, use multiple APIs |
| User engagement drops | High | Gamification, streaks, social features |
| High audio storage costs | Medium | Compress files, delete old unused songs |
| App store rejection | High | Follow guidelines, avoid copyright issues |

---

## 9. Next Steps

1. **Immediate Actions:**
   - [ ] Set up project repository
   - [ ] Initialize React Native + Expo project
   - [ ] Set up development environment
   - [ ] Create initial folder structure

2. **Week 1 Goals:**
   - [ ] Working Bible verse search
   - [ ] Basic UI mockups
   - [ ] Backend API skeleton

3. **Month 1 Goals:**
   - [ ] Complete Phase 1 (Core Infrastructure)
   - [ ] Begin Phase 2 (AI Song Generator prototype)

---

## 10. Project Structure (Planned)

```
scripture-memory/
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # State management
│   │   ├── utils/          # Helpers
│   │   └── api/            # API client
│   ├── assets/             # Images, fonts
│   └── app.json            # Expo config
├── backend/                # Node.js/Python API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── ai/             # AI song generation
│   │   └── middleware/     # Auth, logging
│   └── package.json
├── docs/                   # Documentation
│   ├── DEV_PLAN.md         # This file
│   ├── API.md              # API documentation
│   └── SETUP.md            # Setup instructions
└── README.md               # Project overview
```

---

## End of Development Plan

**Status:** Ready to begin Phase 1
**Next Review:** After Phase 1 completion
**Contact:** [Project lead contact info]
