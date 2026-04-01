# Setup — Scripture Memory

## Quick Start

**Terminal 1 — Backend:**
```bash
cd "D:/Scripture Memory/backend"
node src/index.js
# Runs on http://localhost:3000
```

**Terminal 2 — Mobile:**
```bash
cd "D:/Scripture Memory/mobile"
npx expo start --port 8082        # Phone via Expo Go
npx expo start --web --port 8083  # Web browser (dev)
```

**Web dev tip:** Open Chrome → `http://localhost:8083` → F12 → Ctrl+Shift+M for mobile viewport simulation.

---

## Prerequisites

- Node.js 20+
- Expo Go app (for phone testing) or Chrome (for web dev)

---

## Environment

**`backend/.env`** (required):
```bash
ELEVEN_API_KEY=sk_...
```

---

## Phone Testing Note

The backend IP is hardcoded in `mobile/api/bibleApi.ts`:
```
192.168.86.30:3000
```
Update this if your PC's local IP changes.

---

## Troubleshooting

**Module not found after `npm install`:**
```bash
npx expo start --clear
```

**Backend not connecting on phone:**
Check that `bibleApi.ts` IP matches your PC's current local IP (`ipconfig` to find it).

**Backend song generation fails:**
Verify `ELEVEN_API_KEY` is set in `backend/.env`.
