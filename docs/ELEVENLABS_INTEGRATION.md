# ElevenLabs Music API Integration

**Status:** Backend ✅ Complete | Frontend ⏳ Pending
**Last Updated:** December 10, 2025

---

## API Configuration

```
POST https://api.elevenlabs.io/v1/music
Headers:
  xi-api-key: <ELEVEN_API_KEY>
  Content-Type: application/json
```

Request body:
```json
{
  "prompt": "...",
  "music_length_ms": 25000,
  "model_id": "music_v1"
}
```

Response: Binary MP3 (~391KB, ~12s generation time)

---

## Prompt Template

```
Create a simple, melodic Christian worship-style song designed to help memorize scripture.

Lyrics to use:
"${verseText}"

Requirements:
- Style: ${style} (default: gentle worship)
- Tempo: 80–100 BPM
- Melody should be repetitive for easy memorization
- Vocals should be clear and easy to follow
```

### Prompt Notes (from testing)
- This prompt produces the best results — do not over-engineer it
- Adding strict constraints (no improvisation, no repeat, minimal instrumentation) makes output noticeably worse
- "No long instrumental intro" caused ElevenLabs to strip the backing track entirely — avoid it
- The instrumental is important: it reinforces the vocal melody for memorization

---

## Backend Implementation

**Service:** `backend/src/services/elevenLabsService.js`
- `generateMusic(verseText, style, duration)` → returns audio Buffer

**Route:** `backend/src/routes/songs.js`
- `POST /api/v1/songs/generate` → MP3 binary
- `GET /api/v1/songs/cache` → debug cache view

**Caching:** In-memory Map, key = `${reference}:${style}`

> **Known issue:** Fixed 25s duration causes lyrics to be cut off for longer passages. Future fix: dynamic duration formula based on passage word count. Do not remove `music_length_ms` — omitting it causes ElevenLabs to default shorter, making the problem worse.

---

## Frontend Integration (Pending)

**File:** `mobile/api/bibleApi.ts`

```typescript
async function generateSong(verse: string, reference: string, style = 'gentle worship') {
  const response = await fetch('http://192.168.86.30:3000/api/v1/songs/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verse, reference, style })
  });
  const blob = await response.blob();
  // Save to Expo FileSystem, return local path for playback
}
```

UI flow: Select verse → "Generate Song" → loading (~12s) → audio player

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 422 validation error | Ensure `model_id` is exactly `music_v1` |
| Timeout | Normal — generation takes ~12s. Add loading UI. |
| No audio in response | Ensure `responseType: 'arraybuffer'` in axios config |
| Cache miss | Cache key must be `${reference}:${style}` (exact match) |
