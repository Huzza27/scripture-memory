# Codebase Review — Scripture Memory Mobile
**Date:** 2026-07-10 *(updated)*
**Reviewer:** Sambo (AI)
**Overall Grade: C** *(steady progress on UI and routing)*

---

## Grades by Category

| Category | Grade | Summary |
|---|---|---|
| Architecture & Structure | C+ | Expo Router solid; Pack type + factory added; Packs route wired |
| TypeScript | B- | Pack.ts + Verse.ts typed; some inline `as string` casts remain |
| Component Design | B- | DailyMenu refactored (groupBy, useState packList); TopBar componentized |
| State Management | D | Still all local useState; no persistence yet |
| Styling Consistency | C+ | NativeWind dominant; safelist added for spacing tokens; mixed inline still exists |
| Bugs & Issues | C | Filter wiring fixed; groupBy logic correct; hook placement errors resolved |
| Completeness | D | Packs detail page built; practice screen still stub; no backend |

---

## Session Progress (2026-07-10)

### Added
- `types/Pack.ts` — `Pack` interface + `createPack()` factory
- `app/packs/[id].tsx` — Full pack detail page (back nav, stats row, verse list, footer)
- `components/Packs/PackVerse.tsx` — Per-verse row (reference, translation badge, timing, status)
- `components/TopBar/TopBar1-5.tsx` + `TopBarSwitcher.tsx` — Modular top bar variants
- `components/Filter/FilterButton.tsx` — Standalone filter button component
- Tailwind safelist for spacing tokens 6–24 (px, py, m, w, h, gap)

### Changed
- `DailyMenu.tsx` — `packList` promoted to `useState`; added `groupBy(key)` helper; filter wiring via `handlePackFilter(filter)`; pack grid uses `flexWrap` + `width: '47%'`
- `tailwind.config.js` — safelist regex patterns for spacing above 5
- Pack route navigation: `JSON.stringify(pack)` passed as `data` param; `JSON.parse` on receive

### Resolved Issues
- Dynamic Tailwind class purging (spacing > 5) → safelist fix
- `useLocalSearchParams` called outside component body → moved inside
- `Duplicate declaration "Pack"` (component name vs type import) → renamed to `PackView`
- Empty `translation={}` JSX attribute → `translation={verse.translation}`
- `flex-1` collapsing pack cards → switched to `minHeight: 150`

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
