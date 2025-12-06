# API Documentation — Scripture Memory App

Backend API reference for Scripture Memory App.

**Base URL:** `http://localhost:3000/api/v1`

**Version:** 1.0.0 (MVP)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Bible API](#bible-api)
3. [Song Generation](#song-generation)
4. [User Library](#user-library)
5. [Memorization Progress](#memorization-progress)
6. [Error Handling](#error-handling)

---

## Authentication

### Register User
**POST** `/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-12-06T12:00:00Z"
  },
  "token": "jwt_token_here"
}
```

---

### Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token_here"
}
```

---

### Refresh Token
**POST** `/auth/refresh`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "token": "new_jwt_token_here"
}
```

---

## Bible API

### Search Verses
**GET** `/bible/search?q={query}`

**Parameters:**
- `q` (required): Search query (e.g., "John 3:16")

**Example:** `/bible/search?q=John 3:16`

**Response:** `200 OK`
```json
{
  "results": [
    {
      "reference": "John 3:16",
      "text": "For God so loved the world, that he gave his only begotten Son...",
      "translation": "KJV",
      "book": "John",
      "chapter": 3,
      "verse": 16
    }
  ]
}
```

---

### Get Chapter
**GET** `/bible/{book}/{chapter}`

**Parameters:**
- `book` (required): Book name (e.g., "John")
- `chapter` (required): Chapter number (e.g., 3)

**Example:** `/bible/John/3`

**Response:** `200 OK`
```json
{
  "reference": "John 3",
  "verses": [
    {
      "verse": 1,
      "text": "There was a man of the Pharisees, named Nicodemus..."
    },
    {
      "verse": 2,
      "text": "The same came to Jesus by night..."
    }
    // ... all verses in chapter
  ],
  "translation": "KJV"
}
```

---

### Get Passage
**GET** `/bible/passage?ref={reference}`

**Parameters:**
- `ref` (required): Passage reference (e.g., "John 3:16-18")

**Example:** `/bible/passage?ref=John 3:16-18`

**Response:** `200 OK`
```json
{
  "reference": "John 3:16-18",
  "text": "For God so loved the world... believes not is condemned already...",
  "verses": [
    {
      "verse": 16,
      "text": "For God so loved the world..."
    },
    {
      "verse": 17,
      "text": "For God sent not his Son..."
    },
    {
      "verse": 18,
      "text": "He that believeth on him..."
    }
  ],
  "translation": "KJV"
}
```

---

## Song Generation

### Generate Song
**POST** `/songs/generate`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "verse_reference": "John 3:16",
  "text": "For God so loved the world, that he gave his only begotten Son...",
  "options": {
    "tempo": 120,
    "style": "simple",  // MVP: only "simple" available
    "voice": "synth"    // MVP: "synth" or "hum"
  }
}
```

**Response:** `201 Created`
```json
{
  "song": {
    "id": "uuid",
    "verse_reference": "John 3:16",
    "audio_url": "https://s3.amazonaws.com/scripture-memory-songs/uuid.mp3",
    "melody_data": {
      "notes": [60, 62, 64, 65, 67, 69, 71, 72],
      "durations": [0.5, 0.5, 0.5, 0.5, 1, 1, 1, 2],
      "tempo": 120,
      "scale": "C major"
    },
    "duration_seconds": 30,
    "created_at": "2025-12-06T12:00:00Z"
  }
}
```

**Status Codes:**
- `201`: Song created successfully
- `400`: Invalid request (missing text, invalid options)
- `401`: Unauthorized (invalid/missing token)
- `500`: Generation failed (AI error, audio synthesis error)

---

### Get Song Status
**GET** `/songs/{song_id}/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "completed",  // "pending", "processing", "completed", "failed"
  "progress": 100,        // 0-100
  "audio_url": "https://...",
  "error": null
}
```

---

## User Library

### Get User Songs
**GET** `/library/songs`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "songs": [
    {
      "id": "uuid",
      "verse_reference": "John 3:16",
      "full_text": "For God so loved...",
      "audio_url": "https://...",
      "duration_seconds": 30,
      "created_at": "2025-12-06T12:00:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

### Get Single Song
**GET** `/library/songs/{song_id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "song": {
    "id": "uuid",
    "verse_reference": "John 3:16",
    "full_text": "For God so loved the world...",
    "audio_url": "https://...",
    "melody_data": { /* ... */ },
    "duration_seconds": 30,
    "created_at": "2025-12-06T12:00:00Z"
  }
}
```

---

### Delete Song
**DELETE** `/library/songs/{song_id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Memorization Progress

### Get Progress
**GET** `/progress`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "verses": [
    {
      "verse_reference": "John 3:16",
      "last_reviewed": "2025-12-06T12:00:00Z",
      "memory_score": 85,
      "streak": 7,
      "total_reviews": 15,
      "next_review": "2025-12-07T12:00:00Z"
    }
  ],
  "stats": {
    "total_verses": 10,
    "mastered_verses": 3,  // score >= 90
    "current_streak": 7,
    "longest_streak": 14
  }
}
```

---

### Update Progress
**POST** `/progress/{verse_reference}/review`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "score": 85,  // 0-100, user's self-assessment or test score
  "completed": true
}
```

**Response:** `200 OK`
```json
{
  "verse_reference": "John 3:16",
  "memory_score": 85,
  "streak": 8,
  "total_reviews": 16,
  "next_review": "2025-12-08T12:00:00Z"
}
```

---

### Get Review Schedule
**GET** `/progress/schedule`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "today": [
    {
      "verse_reference": "John 3:16",
      "last_reviewed": "2025-12-05T12:00:00Z",
      "memory_score": 85
    }
  ],
  "upcoming": [
    {
      "verse_reference": "Romans 8:28",
      "scheduled_for": "2025-12-07T12:00:00Z",
      "memory_score": 70
    }
  ]
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "issue": "Email already registered"
    }
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request or validation error |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Valid token but insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error (logged for debugging) |
| `GENERATION_FAILED` | 500 | AI song generation failed |

---

## Rate Limiting

**Default Limits:**
- **Authentication:** 5 requests/minute
- **Bible API:** 60 requests/minute
- **Song Generation:** 10 requests/hour (MVP), 5/month (free tier)
- **All other endpoints:** 100 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1638835200
```

---

## Pagination

**Standard Query Parameters:**
- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Starting position (default: 0)

**Response Fields:**
```json
{
  "data": [ /* ... */ ],
  "total": 150,
  "limit": 20,
  "offset": 40,
  "has_more": true
}
```

---

## Versioning

API version is included in URL path: `/api/v1/...`

Breaking changes will increment major version: `/api/v2/...`

---

## Development Notes

### MVP Scope
- Single translation (KJV)
- Simple melody style only
- Basic authentication (no OAuth)
- Limited song generation (5/month free tier)

### Future Endpoints (Post-MVP)
- `POST /songs/{id}/remix` — Regenerate with different style
- `GET /songs/shared/{share_id}` — Public song sharing
- `POST /social/share` — Share song to social media
- `GET /daily-verse` — Verse of the day with pre-generated song

---

## Testing

**Base URL (Development):** `http://localhost:3000/api/v1`

**Sample cURL:**
```bash
# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Search verse
curl http://localhost:3000/api/v1/bible/search?q=John+3:16

# Generate song (requires token)
curl -X POST http://localhost:3000/api/v1/songs/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verse_reference":"John 3:16","text":"For God so loved..."}'
```

---

**Last Updated:** December 6, 2025
**Status:** MVP Specification
