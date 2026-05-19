# Scripture Memory — Future Feature Ideas

A running list of ideas for future development. Not prioritized or committed to — just a place to capture them.

---

## Practice & Memorization

### Fill-in-the-Lyric Mode
While the generated song plays, certain words are silenced. User must type the first letter of the missing word in rhythm. Combines audio memory with active recall.

### Rhythm Recall Mode
Words appear one at a time in beat with the song tempo. User taps or types in sync. Reinforces muscle memory and rhythm-based recall.

### Typing Full Verse Mode
Toggle for advanced users — instead of first-letter input, type the entire verse from memory. Score by string similarity (fuzzy match to handle minor errors).

### Verse Dictation Mode
Audio plays the full verse (TTS or song). User types what they hear. Tests both listening comprehension and recall simultaneously.

### Timed Challenge
Add a countdown timer to practice sessions. Faster completion = bonus score. Optional — shouldn't feel rushed for beginners.

### Reverse Reference Mode (Flashcard B)
Show a verse snippet and ask the user to name the reference. Currently flashcard design exists in spec but isn't built yet.

### Smart Word Difficulty
Track which specific words a user misses most. In Stage 2, prioritize hiding those words rather than random selection. Surface them more often.

### Adaptive Stage Regression
If accuracy drops below 60% after advancing to Stage 2 or 3, offer to step back a stage. Currently only advances, never regresses.

### Streak Calendar
Heatmap-style calendar showing daily practice activity. Visual motivation to maintain streaks.

---

## Audio & Songs

### Song Looping Segments
Allow user to loop just a 5–10 second portion of a song (e.g. a hard phrase) instead of the whole track.

### Tempo Control
Slider to slow down or speed up song playback. Useful for longer or faster songs where lyrics blur.

### Offline Song Storage
Save generated MP3s to device storage (expo-file-system) so they work without internet. Current base64 approach works but is memory-heavy.

### Multiple Songs Per Verse
Generate and store multiple songs per verse in different styles. User can pick their favorite or cycle through.

### Song Sharing
Export a generated song as an MP3 and share via the native share sheet. Could be a great viral/social feature.

### Background Audio
Keep song playing while the app is backgrounded or the screen is off. Passive listening while commuting, exercising, etc.

### Custom Style Input
Let users type a custom style prompt instead of choosing from presets (e.g. "country gospel with banjo").

---

## Organization & Collections

### Passage Support
Save and practice multi-verse passages (e.g. Romans 8:1–11) as a single unit. The Passage button in the FAB exists but isn't wired up yet.

### Tags
Tag verses with custom labels (e.g. "faith", "comfort", "memorized") in addition to or instead of folders. More flexible than folder-only organization.

### Import from Plan
Paste a Bible reading plan and auto-save all referenced verses. Bulk add without searching one by one.

### Shared Folders
Share a folder (collection of verses) with another user via a link or QR code. Good for small groups or families.

### Church/Group Mode
A leader creates a verse set and shares it with a group. Members track their own progress independently.

---

## Progress & Motivation

### Spaced Repetition Engine
Full SM-2 or FSRS algorithm for scheduling reviews. Currently uses a simplified fixed-interval system. True SRS adapts to each user's memory curve.

### Mastery Dashboard
A home screen summary showing: total verses, mastered count, current streaks, stages per verse, and a "due for review" queue.

### Weekly Goal Setting
Let the user set a weekly goal (e.g. "practice 3 verses per week") and track progress toward it with a simple progress ring.

### Achievement Badges
Milestone rewards: first verse mastered, 7-day streak, 10 verses saved, first song generated, etc. Lightweight gamification.

### Verse of the Day
A notification or home screen widget with a randomly selected saved verse to review quickly each morning.

---

## Social & Accounts

### User Accounts
Sign in with Google/Apple. Sync verses, progress, and songs across devices. Currently all local (AsyncStorage only).

### Cloud Song Storage
Store generated songs in the cloud (S3 or similar) instead of re-generating on each device. Saves ElevenLabs API costs.

### Progress Export
Export a full progress report (CSV or PDF) of all verses, stages, accuracy history, and dates mastered.

---

## UX & Polish

### Onboarding Flow
First-launch walkthrough: add your first verse, generate a song, do one practice session. Reduces cold-start friction.

### Dark Mode
Full dark theme support. Currently only light mode.

### Haptic Feedback
Subtle haptics on correct/wrong letter input during practice. More satisfying on mobile than visual feedback alone.

### Verse Card Swipe Actions
Swipe left on a verse card to delete, swipe right to open practice. Faster than tapping into the detail screen.

### Search Saved Verses
A search bar on the home screen to filter saved verses by reference or keyword. Useful once a user has many verses saved.

### Larger Verse Limit
The current 10-verse cap is intentionally conservative. Consider raising it (25–50) once the UX scales gracefully.

---

## Technical

### Push Notifications
Daily reminders to practice. Configurable time and frequency in Settings.

### ElevenLabs Dynamic Duration
Compute song length dynamically based on word count rather than a fixed 25 seconds. Prevents lyrics being cut off for longer passages.

### Offline Bible Data
Bundle a local Bible database so verse lookup works without internet. Currently depends on bible-api.com.

### Web App PWA
Make the Expo web build installable as a Progressive Web App. Gives a near-native experience on desktop/Android without an app store.

### Native App Build
Build and submit to App Store (iOS) and Google Play (Android). Currently only tested via Expo Go and web.
