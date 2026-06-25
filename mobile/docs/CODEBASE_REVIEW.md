# Codebase Review — Scripture Memory Mobile
**Date:** 2026-06-25
**Reviewer:** Sambo (AI)
**Overall Grade: D+** *(normal for early prototype)*

---

## Grades by Category

| Category | Grade | Summary |
|---|---|---|
| Architecture & Structure | C | Router setup good, no state management or API layer |
| TypeScript | B- | Strict mode on, incomplete types and annotations |
| Component Design | C+ | DailyMenu bloated, hardcoded data, dead callbacks |
| State Management | D | All local useState, no persistence, no shared state |
| Styling Consistency | F | Three approaches mixed simultaneously |
| Bugs & Issues | D | Logic errors, empty callbacks, missing tailwind tokens |
| Completeness | D- | No backend, no error handling, no tests, practice screen is a stub |

---

## 1. Architecture & Structure (C)

**Good:**
- Expo Router file-based routing is set up correctly
- Logical folder separation: `components/`, `types/`, `constants/`, `app/`

**Problems:**
- No state management layer (Context, Zustand, Redux)
- No API/service layer — all data is hardcoded
- No custom hooks for business logic
- No error handling infrastructure

---

## 2. TypeScript (B-)

**Good:**
- `strict: true` in tsconfig
- `Verse` interface exists in `types/Verse.ts`

**Problems:**
- `DailyVerseCard` takes `verse: string` instead of `verse: Verse`
- Missing return type annotations on functions
- `VersePracticeModeSelection` references `bg-surface` which isn't in tailwind config
- Verse ID generated inline from string manipulation — fragile

---

## 3. Component Design (C+)

**Good:**
- Components are small and focused individually
- Some composition (DailyMenu → DailyVerseCard + VersePracticeModeSelection)

**Problems:**
- `DailyMenu` mixes UI state, animation logic, navigation, and hardcoded data
- 4 identical hardcoded `DailyVerseCard` components — should be `.map()` over array
- `onPractice` and `onFlashcards` passed as empty `() => {}` — dead code
- `VersePracticeModeSelection` not reusable for other contexts

---

## 4. State Management (D)

**Problems:**
- No centralized state — everything is local `useState`
- Navigating between screens loses state
- No persistence layer (AsyncStorage etc.)
- Animation state mixed with UI state in same component
- Modal state management is fragile (visible prop + mounted workaround)

**Fix needed:** React Context minimum, wrapping the app in `_layout.tsx`

---

## 5. Styling Consistency (F) — Critical

Three styling approaches used simultaneously:

1. **StyleSheet** — `DailyMenu.styles.ts`
2. **NativeWind className** — `className="w-full bg-accent"`
3. **Inline style objects** — `style={{ flex: 1, color: Colors.accent }}`

Colors are also duplicated — defined in both `constants/colors.ts` AND `tailwind.config.js`.

**Fix:** Consolidate to NativeWind/className exclusively. Delete `DailyMenu.styles.ts` and inline styles.

---

## 6. Bugs & Issues (D)

| Bug | Location | Severity |
|---|---|---|
| `setSelectedVerse` then immediately `router.push` — state won't update before nav | DailyMenu.tsx:35 | Medium |
| `bg-surface` not defined in tailwind config | VersePracticeModeSelection.tsx | Medium |
| 4 hardcoded identical verse cards | DailyMenu.tsx:84-87 | Low |
| Dynamic className template literals may not survive Tailwind purge | DailyMenu.tsx:49 | Low |
| Empty `onPractice` / `onFlashcards` callbacks | DailyMenu.tsx:95 | Low |
| Verse ID generated from string replace — collision risk | DailyVerseCard.tsx:15 | Low |

---

## 7. What's Missing (D-)

- **Data:** No real verse data source, no backend integration, no persistence
- **Features:** Practice modes not implemented, no flashcards, no progress tracking
- **Error handling:** No error boundaries, no try/catch, no loading states
- **Testing:** No test files or test infrastructure
- **Accessibility:** No `accessibilityLabel`, no screen reader support
- **Navigation:** Only 2 screens; practice screen is a placeholder

---

## Priority Fixes (Before Codebase Gets Bigger)

1. **Pick one styling approach** — NativeWind everywhere, remove StyleSheet and inline styles
2. **Add React Context global store** — verse list and selected verse accessible across screens
3. **Replace hardcoded cards** with `.map()` over a real data array
4. **Wire up `onPractice` / `onFlashcards`** or remove the props

---

## What's Good

- Modern tooling (Expo Router, NativeWind, TypeScript strict, Reanimated)
- UI is shaping up well visually
- Routing works
- Component structure is on the right track
- Lora font integration is clean
