# Codebase Review

**Date:** 2026-05-05
**Reviewer:** Sambo
**Grade: B-**

---

## Summary

Architecture decisions are generally sound — SRS logic, context patterns, route structure are all reasonable. The main drag is that `index.tsx` has grown into a monolith, a hardcoded 10-verse limit is a product-killing constraint, and the storage/API coupling needs to be untangled. The backend needs input validation and TypeScript.

---

## What's Working Well

- **SRS implementation** (`utils/storage.ts`) — stage/streak/interval logic is correct and readable
- **`fireSync` pattern** — non-blocking background sync without UX disruption
- **Context architecture** (Auth, Drag, Preferences) — appropriate and clean
- **`api/bibleApi.ts`** — well-typed with proper interfaces and a clean class structure
- **Backend middleware** — helmet, CORS, rate limiting, JWT, connection pooling all present
- **Component extraction** — modals are properly separated into `components/`

---

## Issues

### 🔴 Critical

#### 1. `app/index.tsx` is a God Component (1,051 lines)
Handles verse list, folder rendering, drag-and-drop, FABs, and 3+ modals in a single file.
**Fix:** Extract `VerseList`, `FolderRow`, `DragLayer`, and FAB into sub-components or sibling files.

#### 2. `MAX_SAVED_VERSES = 10` Hard Limit
Hardcoded in `utils/storage.ts`. A memorization app where users can only save 10 verses is a product-killing constraint.
**Fix:** Remove the limit or make it a preference. There is no technical reason to cap it.

#### 3. Storage Layer Imports API Layer (`utils/storage.ts` → `api/bibleApi.ts`)
Dependency inversion violation. Storage should be pure local I/O. Sync logic should sit above both, not inside storage.
**Fix:** Move `fireSync` and all `bibleApi.sync*` calls into a `syncService.ts` layer that wraps storage operations. Storage becomes pure AsyncStorage.

---

### 🟠 Significant

#### 4. `fireSync` Swallows All Errors Silently
```ts
fn().catch(() => {}); // sync failures are invisible
```
**Fix:** At minimum, log: `fn().catch(e => console.warn('[sync]', e))`.

#### 5. CORS is Wide Open
```js
app.use(cors()); // no origin restriction
```
Fine for development, a security hole in production.
**Fix:** Restrict to known origins via env var: `cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') })`.

#### 6. `database.js` Calls `process.exit(-1)` on Pool Error
Crashes the entire server on any transient DB error.
**Fix:** Log the error and let the request fail gracefully. Use a health check to surface persistent DB issues.

#### 7. No Request Validation on Backend Routes
Malformed payloads reach route handlers with no validation. No Zod, Joi, or equivalent.
**Fix:** Add a lightweight validation layer (e.g. `zod` + a validate middleware) on all `POST`/`PUT` routes.

#### 8. Backend is Plain JS, Frontend is TypeScript
No shared types, no compile-time safety on the API contract. Drift between frontend expectations and backend responses is invisible until runtime.
**Fix:** Migrate backend to TypeScript, or at minimum add JSDoc types and a shared `types/` package.

---

### 🟡 Minor

#### 9. `Date.now().toString()` Used as IDs
Collision-prone if two saves happen within the same millisecond.
**Fix:** Use `crypto.randomUUID()` (available in Node 14.17+ and React Native).

#### 10. No React Error Boundaries
A crash in one screen propagates to the whole app.
**Fix:** Wrap major routes with an `<ErrorBoundary>` component (e.g. `react-error-boundary`).

#### 11. Song Endpoint Has No Dedicated Rate Limit
The ElevenLabs route (~12s per call) is only covered by the global 100 req/15min limiter. A few concurrent requests can exhaust the budget.
**Fix:** Apply a tighter per-IP rate limit specifically to `POST /api/v1/songs/generate`.

#### 12. DB Pool Logs Every Connection in Production
```js
pool.on('connect', () => console.log('✅ Database connected'));
```
**Fix:** Guard behind `if (process.env.NODE_ENV !== 'production')`.

#### 13. `verse/[id].tsx` is Also Too Large (640 lines)
Contains practice logic, song player, folder management, and schedule picker in one component.
**Fix:** Extract `SongSection`, `PracticeSection`, and `VerseMetaSection` into sub-components.

---

## Testing Coverage

| Layer | Status |
|---|---|
| Mobile utils (`bibleData`, `recallUtils`, `storage`) | ✅ 3 files |
| Backend routes/services | ✅ 2 files |
| React components | ❌ None |
| Integration / E2E | ❌ None |

The util tests are a solid start. Next priorities: component tests for `SongPlayer`, `AddVerseModal`, and integration tests for the sync flow.

---

## Grades by Dimension

| Dimension | Grade | Notes |
|---|---|---|
| Architecture | B+ | Good patterns; storage/API coupling is the weak point |
| Code Quality | C+ | God components drag this down significantly |
| Backend | B- | Solid foundation; needs validation and TypeScript |
| Data Modeling | B | SRS system is good; 10-verse cap is a product flaw |
| Testing | C | Util coverage only; no component or integration tests |
| **Overall** | **B-** | |

---

## Recommended Priority Order

1. Remove the 10-verse limit (5 min, high impact)
2. Fix `fireSync` error logging (5 min)
3. Break up `index.tsx` (high effort, high maintainability gain)
4. Add backend request validation
5. Move sync logic out of `storage.ts`
6. Add CORS origin restriction before any production deploy
7. Migrate backend to TypeScript
