# Android Compatibility Fixes

Audit conducted: 2026-06-18
Reanimated migration: 2026-06-19
Root cause: App was developed and tested primarily on web (Expo web), creating a systematic bias toward web APIs and layout patterns that don't translate to Android.

---

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

---

## CRITICAL — Will crash on Android

### C1 — `btoa()` for Base64 audio encoding
- **File:** `mobile/api/bibleApi.ts` ~line 319
- **Issue:** `btoa()` is a web-only API. Song generation crashes on Android.
- **Fix:** Added `uint8ArrayToBase64()` helper (manual base64 encoder). Native path writes MP3 to `FileSystem.cacheDirectory` via `expo-file-system` and returns a file URI. Web path still uses btoa.
- [x] Fixed

### C2 — Dev auth bypass hardcoded
- **File:** `mobile/context/AuthContext.tsx` ~line 51
- **Issue:** Entire auth flow bypassed with a hardcoded token. Real login never runs.
- **Fix:** Removed bypass. State now initializes to `{ token: null, user: null, loading: true }` and loads from secure storage on mount.
- [x] Fixed

### C3 — DOM APIs in Gluestack provider
- **File:** `mobile/components/ui/gluestack-ui-provider/index.web.tsx`
- **Issue:** `document.createElement`, `window.matchMedia`, `classList`, `querySelector` used directly. Crashes on native if this file is bundled incorrectly.
- **Fix:** Verified — native `index.tsx` is clean (pure React Native, no DOM APIs). The `.web.tsx` extension means Metro/Expo automatically routes native builds to `index.tsx`. No code change needed.
- [x] Verified (no change needed)

---

## HIGH — Likely broken on Android

### H1 — `maxHeight` on animated bottom sheets
- **Files:** `mobile/components/VerseContextMenu.tsx` ~line 93, `mobile/components/FolderPickerModal.tsx` ~line 80
- **Issue:** `maxHeight` + transform animations produce unpredictable sizing on Android. Content overflows or clips incorrectly.
- **Fix:** Replaced `maxHeight` with explicit `height` (same proportional value) on all three sheet components. The `translateY` outputRange also updated to use `sheetHeight` instead of full `screenHeight` so animation starts from actual sheet position.
- [x] Fixed

### H2 — `Dimensions.get()` stale value used in sheet animations
- **Files:** `mobile/components/VerseContextMenu.tsx` ~line 66, `mobile/components/FolderPickerModal.tsx` ~line 23, `mobile/components/FolderContextMenu.tsx`
- **Issue:** `Dimensions.get("window")` is called once at mount. On Android, value goes stale after rotation — sheet animations break.
- **Fix:** Replaced with `useWindowDimensions()` hook in all three components. Also removed unused `Dimensions` import.
- [x] Fixed

### H3 — `SafeAreaView` insufficient for Android edge-to-edge
- **Files:** `mobile/components/BookPickerModal.tsx`, `mobile/components/AddVerseModal.tsx`
- **Issue:** `app.json` has `edgeToEdgeEnabled: true`. `SafeAreaView` alone doesn't handle Android 10+ gesture nav bar. Content draws under system UI.
- **Fix:** Replaced `SafeAreaView` with `useSafeAreaInsets()` from `react-native-safe-area-context`. Apply `paddingBottom: insets.bottom` (with fallback to 16) on the sheet container in both files.
- [x] Fixed

### H4 — Absolute-positioned modal backdrops
- **Files:** `mobile/components/VerseContextMenu.tsx`, `mobile/components/FolderPickerModal.tsx`, `mobile/components/FolderContextMenu.tsx`
- **Issue:** Nesting `TouchableOpacity` inside an `Animated.View` with opacity animation means touch responsiveness degrades at low opacity. On Android, the view can become unresponsive.
- **Fix:** Separated touch area and visual overlay — `TouchableOpacity` at full-screen absolute, `Animated.View` on top with `pointerEvents="none"`. Touch always registers regardless of animation state.
- [x] Fixed

### H5 — Tailwind + inline style mixing on layout-critical components
- **Files:** Throughout (`app/index.tsx`, `app/verse/[id].tsx`, etc.)
- **Issue:** If NativeWind skips a class (e.g., `rounded-xl`, `border`), there's no inline fallback. Borders, corners, spacing may silently not render.
- **Fix:** Move layout-critical styles (borders, radius, padding, flex) to explicit `style` prop. Keep Tailwind only for non-critical helpers.
- [ ] Fixed

### H6 — `KeyboardAvoidingView` unhandled for Android
- **Files:** `mobile/app/login.tsx` ~line 45, `mobile/app/account.tsx` ~lines 96, 149
- **Issue:** `behavior` is set for iOS only (`'padding'`), `undefined` for Android. Keyboard covers inputs.
- **Fix:** Changed to `Platform.OS === 'ios' ? 'padding' : 'height'` in login.tsx and both KeyboardAvoidingView instances in account.tsx.
- [x] Fixed

---

## MEDIUM — Degraded experience

### M1 — Hardcoded colors bypassing theme system
- **Files:** `mobile/app/practice.tsx`, `mobile/app/folders.tsx`, `mobile/app/search.tsx`, `mobile/app/stats.tsx`, `mobile/components/SongPlayer.tsx`, `mobile/components/StylePickerModal.tsx`, `mobile/components/TranslationPicker.tsx`, `mobile/components/BookPickerModal.tsx`
- **Issue:** Hardcoded hex values don't adapt to system dark mode on Android.
- **Fix:** Added `useTheme()` to all affected files. Replaced all hardcoded colors with `theme.*` equivalents. Note: `shadowColor: "#000"`, `#fff` text on colored buttons, and `STAGE_COLORS` map (intentional stage indicators) are kept as-is.
- [x] Fixed

### M2 — Shake animation performance on Android
- **File:** `mobile/app/practice.tsx`
- **Issue:** `Animated.sequence()` with multiple timings can starve the animation thread when a large verse list is loaded.
- **Fix:** Not needed — animation uses `useNativeDriver: true` (now `Platform.OS !== 'web'`), which runs on the native thread regardless of JS load. No JS thread starvation possible.
- [x] N/A (already correct)

### M3 — `useNativeDriver` not conditional on platform → superseded by Reanimated migration
- **Files:** `app/index.tsx`, `app/practice.tsx`, `app/verse/[id].tsx`, `components/FolderContextMenu.tsx`, `components/FolderPickerModal.tsx`, `components/RadialFAB.tsx`, `components/SkeletonCard.tsx`, `components/VerseContextMenu.tsx`
- **Issue:** `useNativeDriver: true` on web causes console warnings; `Platform.OS !== 'web'` pattern meant all animations ran on the JS thread on web and were never properly tested on Android. On Android new architecture (Fabric), old `Animated` API with `useNativeDriver` caused silent failures — animations simply didn't run.
- **Fix (phase 1):** Changed all `useNativeDriver: true` → `useNativeDriver: Platform.OS !== 'web'`
- **Fix (phase 2 — 2026-06-19):** Migrated animated components to `react-native-reanimated` (see Reanimated Migration section below). `Platform` conditionals eliminated entirely.
- [x] Fixed

---

## LOW — Minor

### L1 — Missing `scrollIndicatorInsets` on FlatList
- **Files:** `mobile/app/practice.tsx` ~line 168, `mobile/app/stats.tsx` ~line 142
- **Fix:** Added `scrollIndicatorInsets={{ right: 1 }}` to both FlatLists.
- [x] Fixed

### L2 — Arbitrary Tailwind font sizes don't scale on high-DPI Android
- **Files:** `app/stats.tsx`, `components/CreateFolderModal.tsx`, `components/MoveSuggestionBanner.tsx`
- **Issue:** `text-[9px]` and `text-[10px]` are risky — too small for accessibility scaling and may not apply on some devices. Larger arbitrary sizes (`text-[11px]` to `text-[19px]`) are fine (dp units, DPI-independent).
- **Fix:** Converted all `text-[9px]` and `text-[10px]` to explicit `style={{ fontSize: N }}` props. Also fixed a leftover hardcoded `#ef4444` in stats.tsx → `theme.red`.
- [x] Fixed

---

## Reanimated Migration (2026-06-19)

Root cause of remaining animation failures: old `Animated` API from React Native core silently fails on Android new architecture (Fabric/TurboModules). `useNativeDriver: Platform.OS !== 'web'` was a band-aid — animations still ran on JS thread on web and failed on Android native.

### Setup
- Upgraded `react-native-reanimated` 4.1.1 → **4.3.0**
- Downgraded `react-native-worklets` 0.9.2 → **0.8.3**
- Reason: RN 0.81.5 is compatible with reanimated 4.3.0 (requires RN 0.81–0.85) + worklets 0.8.x
- Ran `npx expo run:android` to build native binary with Reanimated TurboModule
- Set `JAVA_HOME=C:\Program Files\Java\jdk-17` and `ANDROID_HOME=C:\Users\Sam\AppData\Local\Android\Sdk` permanently via `setx`
- Babel plugin: `react-native-worklets/plugin` (already present in `babel.config.js`)

### Files migrated

#### `app/index.tsx` — calendar/daily section
- `dailyMenuAnim`, `arrowRotateAnim`, `calendarScale` → `useSharedValue`
- `Animated.timing/sequence` → `withTiming`, `withSequence`
- Chevron rotate + calendar icon scale → `useAnimatedStyle`
- Daily menu expand/collapse → `entering={FadeInDown}` / `exiting={FadeOutUp}` (handles mount/unmount timing automatically)
- Removed `Platform` import

#### `components/RadialFAB.tsx` — FAB menu
- Full rewrite: old `Animated` array + springs → 3 named `useSharedValue` hooks (rules of hooks — no arrays)
- Redesigned from horizontal pills → **radial arc menu** (3 buttons fan out at 90°/48°/8° from horizontal)
- Fixed safe area: added `useSafeAreaInsets()`, FAB bottom offset now `BOTTOM_OFFSET + insets.bottom` — previously FAB sat behind Android gesture bar and was untappable
- Backdrop: removed entirely (was causing black bar rendering artifact). Replaced with invisible full-screen `TouchableOpacity` at `zIndex: 10`; FAB container at `zIndex: 20`
- All animations: `withTiming` + `Easing.out(Easing.cubic)`, no springs

#### `components/VerseContextMenu.tsx` — long-press verse sheet
- `slideAnim`, `backdropAnim` → `useSharedValue`
- Removed `if (!verse) return null` guard — was unmounting component before close animation could play
- Sheet slide: `translateY: (1 - slideAnim.value) * sheetHeight` inline in `useAnimatedStyle`
- Open: `withSpring` → `withTiming(1, { duration: 280 })` (no bounce)
- `verse &&` guards added to JSX content that requires verse data

### Remaining files (not yet migrated)
- `app/practice.tsx` — shake animation
- `app/verse/[id].tsx` — flash animation
- `components/SkeletonCard.tsx` — pulse loop
- `components/FolderContextMenu.tsx` — slide sheet
- `components/FolderPickerModal.tsx` — slide sheet

### Rules going forward
- **Never use `Animated` from `react-native`** for new animations — always use `react-native-reanimated`
- **No springs for UI chrome** (sheets, FABs, menus) — use `withTiming` + `Easing.out(Easing.cubic)`
- **No `Platform.OS !== 'web'` in animation code** — Reanimated handles cross-platform natively
- **No arrays of `useSharedValue`** — declare each as a named hook at component top level

---

## Fix Order (recommended)
1. C1 — btoa crash (song gen)
2. C2 — Remove dev auth bypass
3. C3 — Verify Gluestack web file not bundled to native
4. H2 — useWindowDimensions() swap
5. H3 — useSafeAreaInsets() on modals
6. H6 — KeyboardAvoidingView Android behavior
7. H1 — maxHeight on sheets
8. H4 — Modal backdrop restructure
9. H5 — Style audit (ongoing)
10. M1 — Hardcoded color audit (ongoing)
11. M2, M3, L1, L2 — Polish pass
