# API Reference — Scripture Memory

**Base URL:** `http://localhost:3000/api/v1`

---

## Implemented Endpoints

### Bible

**GET** `/bible/verse/:reference`
```bash
curl http://localhost:3000/api/v1/bible/verse/John%203:16
```
Response:
```json
{
  "success": true,
  "data": {
    "reference": "John 3:16",
    "text": "For God so loved the world...",
    "translation": "KJV"
  }
}
```

**GET** `/bible/chapter/:book/:chapter`
```bash
curl http://localhost:3000/api/v1/bible/chapter/John/3
```

**GET** `/bible/range/:reference`
```bash
curl http://localhost:3000/api/v1/bible/range/John%203:16-18
```

---

### Songs

**POST** `/songs/generate`

Generates a worship song from a verse. Returns MP3 binary (~12s response time). Cached by `reference:style`.

```bash
curl -X POST http://localhost:3000/api/v1/songs/generate \
  -H "Content-Type: application/json" \
  -d '{"verse":"For God so loved the world...","reference":"John 3:16","style":"gentle worship"}' \
  --output song.mp3
```

Request body:
```json
{
  "verse": "verse text",
  "reference": "John 3:16",
  "style": "gentle worship"
}
```

Response: Binary MP3 (`Content-Type: audio/mpeg`)

**GET** `/songs/cache` — Debug: list cached songs
```bash
curl http://localhost:3000/api/v1/songs/cache
```

---

## Planned Endpoints (Phase 4+)

These don't exist yet — documented here for planning:

- `POST /auth/register` / `POST /auth/login` — User accounts
- `GET /library/songs` — User's saved songs (cloud)
- `GET/POST /progress` — Memorization tracking + spaced repetition

---

## Error Format

```json
{
  "success": false,
  "error": "Human-readable message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / missing fields |
| 404 | Verse not found |
| 500 | Server error / API failure |
