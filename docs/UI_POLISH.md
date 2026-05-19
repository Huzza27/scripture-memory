# UI Polish — Scripture Memory App

**Grade: B-** (up from C+ — dark mode, theme system, animations, skeleton loaders shipped)
**Last updated: Apr 2026**

Core screens are functional and well-structured. Theme system in place. Main remaining gaps
are interaction feel (animations) and a few minor UX details.

---

## Theme System

- `utils/theme.ts` — full light/dark palette with named semantic tokens
- `utils/typography.ts` — 6-level type scale (hero → caption)
- `components/ScreenHeader.tsx` — shared themed header used on Home, Stats, Settings
- Pattern: `useTheme()` + `useMemo(() => makeStyles(theme), [theme])` in every screen/component

**Dark palette: Tailwind Slate** (`#0f172a` base) — blue-grey toned, not flat black.
Same palette used by Linear, GitHub dark, Vercel, shadcn/ui. Pairs naturally with blue accent.
Key tokens: `background: #0f172a` / `surface: #1e293b` / `text: #f1f5f9` / `accent: #3b82f6`

Do NOT revert to flat black (`#000`) — it creates a void with no depth.
Do NOT use warm greys — the cool slate undertone is intentional and pairs with the blue accent.

---

## Screen Grades

| Screen | Grade | Notes |
|---|---|---|
| Home (`index.tsx`) | B | Skeleton loaders, press animation, dark mode ✅ |
| Verse / Practice (`verse/[id].tsx`) | B | Word-flow UX works well, dark mode ✅ |
| Flashcards (`flashcards/[id].tsx`) | B+ | Strongest screen, 3D flip ✅, dark mode ✅ |
| Folder Detail (`folders/[id].tsx`) | B- | Functional, dark mode ✅ |
| Stats (`stats.tsx`) | B- | Progress screen, dark mode ✅ |
| Settings (`settings.tsx`) | C+ | One option but clean, dark mode ✅ |
| Search (`search.tsx`) | — | Hidden (replaced by Stats tab) |

---

## Issues, Priority Ordered

---

### P0 — Structural

#### 1. Remove or rebuild the Search tab
**Problem:** `search.tsx` is a Phase 1 relic in a Phase 4 app.
- Uses the old polling-based song API (`generateResponse.jobId`) which no longer works
- Shows raw `audioUrl` as text
- Contains the literal string `"Note: Audio playback coming in Phase 3"`
- `borderRadius: 8` vs `12` everywhere else
- `#4CAF50` green vs `#34c759` system green everywhere else
- Orange Generate button (`#FF9500`) that appears nowhere else
- Users don't use this flow — all add flows live in the FAB on Home

**Fix options:**
- A) Remove the Search tab entirely. Move the Settings gear icon into the Home header.
- B) Replace Search with a **Progress/Stats screen** — streak, total mastered, per-verse history. This aligns with the app's core purpose and gives users a reason to visit.

**Option B is recommended.** A stats screen would be motivating and fills a real gap.

---

#### 2. Settings tab has one option
**Problem:** A full tab for one native Picker is poor use of nav real estate.

**Fix:** Move Default Translation setting into a gear icon in the Home header (top right). Free up the tab slot for the Stats screen (see above).

---

### P1 — Core UX

#### 3. No progress feedback on home screen verse cards
**Problem:** Cards show reference, preview, translation — nothing about mastery. This is a memorization app. Progress should be the loudest visual signal.

**Current:**
```
John 3:16
For God so loved the world...
King James Version (1611)
```

**Target:**
```
John 3:16                    [Stage 2 ●●○]
For God so loved the world...
King James Version (1611)
```

**Fix:** Add a `StageBar` or pill badge to `VerseCard`:
- 3 dots or segments, filled by current stage
- Color: grey → blue → green (mastered)
- Mastered: gold/trophy icon instead of dots
- Data available via `progressStorage` — load all progress on Home alongside verses

---

#### 4. Folder colors are nearly invisible
**Problem:** `folderColorBar` is `width: 5`. Five pixels of color is not a visual identity.

Compare: Things 3 uses bold color accents. Bear uses full-bleed color headers.

**Fix:** Increase color bar to `width: 10–12` minimum. Better: apply folder color to the detail screen header background (tinted, not full saturation). Also tint the Practice button in folder detail to match folder color instead of always blue.

---

#### 5. Flashcard flip is opacity crossfade, not 3D
**Problem:** The flip animation is `opacity: 1→0` (front) and `0→1` (back). It looks like a fade. Every other card app uses a `rotateY` 3D flip. This is the single biggest UX gap in flashcards.

**Fix:** Standard React Native 3D flip pattern:
```tsx
// Two Animated.Values driving front/back rotateY + opacity
// perspective: 1000 on the container
const frontRotate = flipAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg'] });
const backRotate  = flipAnim.interpolate({ inputRange: [0,1], outputRange: ['180deg','360deg'] });
```

---

#### 6. Practice reference-check feels disconnected
**Problem:** After completing word input the screen jumps to a reference entry card. The verse disappears, replaced by a score + text input. There's no visual continuity — it feels like a different screen.

**Fix:**
- Keep a compressed verse preview visible above the reference input
- Animate the score card sliding in from below rather than replacing content
- Label the flow explicitly: a step indicator ("Step 2 of 2 — Enter reference")

---

### P2 — Visual System

#### 7. No typography scale
**Problem:** 13 different font sizes in use (11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28). Same semantic role (section label, body, caption) uses different sizes per screen. `fontWeight: "bold"` and `fontWeight: "700"` both used for the same intent.

**Fix:** Define and enforce a scale:

```ts
// utils/typography.ts
export const type = {
  hero:    { fontSize: 28, fontWeight: '700' },
  title:   { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '700' },
  body:    { fontSize: 15, fontWeight: '400' },
  label:   { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 11, fontWeight: '600' },
} as const;
```

---

#### 8. No dark mode
**Problem:** Every color is hardcoded (`#fff`, `#f9f9f9`, `#333`). Dark mode is a baseline expectation in 2026 — Apple, Google, and virtually every major app supports it.

**Fix:** Replace hardcoded colors with a theme object driven by `useColorScheme()`:
```ts
// utils/theme.ts
const light = { background: '#fff', surface: '#f9f9f9', text: '#111', ... };
const dark  = { background: '#111', surface: '#1c1c1e', text: '#f2f2f7', ... };
export const useTheme = () => useColorScheme() === 'dark' ? dark : light;
```
This is a larger refactor but has the highest impact on perceived quality.

---

#### 9. Header is re-implemented on every screen
**Problem:** Home, Search, and Settings all independently implement the same header pattern (paddingTop: 60, large title, subtitle, grey background, bottom border) with minor inconsistencies in padding, font weight, and border style.

**Fix:** Create a `ScreenHeader` component:
```tsx
<ScreenHeader title="My Verses" subtitle="6/10 saved" rightAction={<GearIcon />} />
```
Used on Home, Settings (after it becomes a sheet), and any future top-level screens.

---

#### 10. Empty states are bare
**Problem:** Home with no verses shows a grey book icon and two lines of text. No warmth, no CTA hierarchy.

**Fix:** On the empty home screen, show:
- A more prominent illustration or larger icon with color
- Primary CTA button: "Add your first verse" (opens FAB or goes straight to Add Verse)
- Brief one-liner about what the app does

Same for empty folder detail — currently just an icon + grey text + "Tap + to add a verse".

---

### P3 — Polish Details

#### 11. Verse cards have no visual hierarchy
All three lines of a verse card (reference, preview, translation) are styled identically except for color/size. The reference should be the dominant element, the preview secondary, the translation label tertiary. Currently the reference is only slightly larger.

**Suggested hierarchy:**
- Reference: `fontSize: 16, fontWeight: '700', color: #111`
- Preview: `fontSize: 13, color: #777, lineHeight: 19`
- Translation: `fontSize: 11, color: #bbb, fontStyle: italic` (much quieter)

#### 12. Practice "tap here if keyboard closes" hint is a workaround
The `keyboardPrompt` row is user-visible scaffolding for a platform quirk. It signals technical debt. The keyboard management should be handled silently (re-focus on scroll tap, `keyboardShouldPersistTaps="always"`, etc.) without exposing the fix to users.

#### 13. Saving/editing operations have no micro-feedback
Tapping "Save" on a verse, adding to folder, or editing — all complete silently. No animation, no brief indicator. Modern apps acknowledge every write with a small visual confirmation.

**Fix:** A brief haptic + success color flash on the affected card, or a toast (not a heavy Alert).

#### 14. Stage advance banner in practice is easy to miss
The "Advanced to Stage 2!" banner appears in the results view but is just a small green row. This is a milestone moment — it deserves a more celebratory treatment (brief animation, larger text, maybe haptic).

#### 15. Move-mode (cross-screen drag) banner could be clearer
The blue banner "Moving [ref] — tap a folder" is subtle. Users returning to the home screen after a long-press might not notice they're in a special mode. Consider a persistent border or overlay tint on the whole screen while in move mode.

---

### P4 — Interaction Feel (vs. Instagram / X benchmark)

#### 16. No press animation on verse cards
**Problem:** Cards use default `TouchableOpacity` opacity fade (0.2 dimming). Instagram, X, and every high-quality native app use a subtle scale + shadow response on press. The current behavior feels web-like.

**Fix:** Wrap cards in a `Pressable` with a `useAnimatedStyle` scale of `0.97` on press. Increase `shadowOpacity` slightly on press to simulate lift. ~20 lines with Reanimated or a simple `Animated.spring`.

---

#### 17. Skeleton loaders instead of ActivityIndicator
**Problem:** When Home opens and loads verses, the screen is blank white/black then content pops in. Instagram-style skeleton placeholders (grey pulsing rectangles) fill the space before data arrives and signal "something is coming" rather than "something broke."

**Fix:** Render 3–4 placeholder `VerseCard` skeletons while `loading === true`. Each skeleton is a grey `borderRadius: 12` rect with an `Animated` opacity pulse. No library needed.

---

#### 18. Hide FAB on empty state
**Problem:** The empty home state shows a centered CTA button ("Add your first verse") AND the FAB in the bottom-left. Two entry points to the same action creates decision noise. Instagram removes competing UI elements when foregrounding an empty state CTA.

**Fix:** Conditionally hide the FAB when `isEmpty === true`. Single line change.

---

#### 19. Tab bar active/inactive icon polish
**Problem:** The tab bar uses default Expo icons with no customization. Active vs. inactive state is not visually distinct enough. Instagram/X use filled icons for active, outline for inactive — a clear "you are here" signal.

**Fix:** In `_layout.tsx`, configure each tab with a filled icon when `focused` and outline when not (e.g. `book` / `book-outline`, `trophy` / `trophy-outline`). No extra library needed.

---

#### 20. Long-press drag visual feedback is too subtle
**Problem:** Long-pressing a verse card triggers haptic + sets card to `opacity: 0.35`. But there's no "lift" animation before the dim — users can miss that drag mode activated. Instagram's reorder mode gives the item a scale-up + shadow pop to signal "I'm holding this."

**Fix:** On long-press activation, briefly animate the card to `scale: 1.04` + increased shadow for ~150ms before settling into the dragging state. Communicates "picked up" clearly.

---

#### 21. No section-level breathing room in verse detail
**Problem:** Sections in `verse/[id].tsx` (practice, song, folders) bleed into each other. The `sectionTitle` labels float without clear visual separation. Instagram and X use generous vertical rhythm and subtle full-width dividers between content blocks to make screens feel premium, not cramped.

**Fix:** Add a `1px` full-width `border.color` divider between major sections (verse box → practice → song → folders). Increase section `paddingTop` to `28` from current `marginBottom: 28`.

---

#### 22. Long-press drag mode — no screen-level indicator
**Problem:** Existing issue (item 15) — the blue banner is subtle. More specifically: there's no full-screen signal that the app is in a special mode. Instagram stories, iOS widget editing, and reorder flows tint the whole background or add a persistent modal overlay to signal "you're in a different mode now."

**Fix:** Apply a very light `rgba(0,122,255,0.05)` overlay tint on the home screen background when `pendingVerse` is set. Reinforces move mode without blocking content.

---

## Positive Foundations to Build On

- **Blue (#007AFF) accent** is consistent throughout core screens — don't change it
- **Card borderRadius (12–20)** feels modern and consistent in the core screens
- **Ionicons** usage is consistent and appropriate throughout
- **The verse display box** (blue left border, `#f0f6ff` background) in verse detail is well-designed — good reading comfort for scripture
- **The 3-round practice word flow** is genuinely well-conceived — just needs better visual continuity between rounds
- **Folder flashcard screen** is the most polished screen — progress bar, score strip, and card layout are all well-executed

---

## Recommended Implementation Order

| # | Change | Effort | Impact |
|---|---|---|---|
| 1 | Remove/replace Search tab | Medium | High | ✅ Done |
| 2 | Stage indicators on verse cards | Small | High | ✅ Done |
| 3 | Bolder folder colors | Small | Medium | ✅ Done |
| 4 | 3D flashcard flip | Small | High | ✅ Done |
| 5 | Typography scale constant | Medium | Medium | ✅ Done |
| 6 | `ScreenHeader` component | Small | Medium | ✅ Done |
| 7 | Better empty states | Small | Medium | ✅ Done |
| 8 | Practice ref-check continuity | Medium | Medium | ✅ Done |
| 9 | Verse card visual hierarchy | Small | Medium | ✅ Done |
| 10 | Dark mode | Large | High | ✅ Done |
| 11 | Card press scale animation | Small | High | ✅ Done |
| 12 | Skeleton loaders on home screen | Small | High | ✅ Done |
| 13 | Hide FAB on empty state | Tiny | Medium | ✅ Done |
| 14 | Tab bar active/inactive icon polish | Small | Medium | ✅ Done |
| 15 | Long-press drag lift animation | Small | Medium | ✅ Done |
| 16 | Section dividers in verse detail | Tiny | Medium | ✅ Done |
| 17 | Screen tint during move mode | Tiny | Medium | ✅ Done |
