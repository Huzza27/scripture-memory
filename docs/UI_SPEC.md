# Scripture Memory App — UI & Interaction Specification

**Status (Apr 2026):** Sections 1–9 fully implemented. Section 4 drag: home-screen drag-to-folder ✅; drag-out from folder detail screen ✅ (cross-screen via DragContext).

## Overview
This document defines the UI structure, user flows, and interaction rules for the Scripture Memory App. The focus is on verse management, folder organization, and memorization flow.

---

## 1. Home Screen (Verses Screen)

### Layout
- Vertical scrollable list
- Order:
  1. Folders (top)
  2. Divider
  3. Individual verses

### Components
- Folder items (grouped visually)
- Divider separating folders and standalone verses
- Verse items
- Floating action button (FAB) in bottom-left corner

### FAB Behavior
- Opens a menu with options:
  - Add Verse
  - Add Passage
  - Add Folder

---

## 2. Folder Creation

### Trigger
- FAB → "Add Folder"

### UI
- Modal or popup
  - Input: Folder Name
  - Input: Folder Color (color picker or preset options)
  - Buttons:
    - Confirm
    - Cancel

### Behavior
- On confirm:
  - Create folder
  - Display at top of Home Screen

---

## 3. Verse Addition

### Trigger
- FAB → "Add Verse" or "Add Passage"

### Behavior
- Use existing implementation (no changes required)

---

## 4. Verse Interaction (Home Screen)

### Tap
- Opens Practice Menu for that verse

### Tap and Hold (Long Press)
- Enters "drag mode"

#### Behavior: Dragging
- User can drag verse into a folder

#### Special Case: Verse Inside Folder
- When dragging:
  - Verse is "lifted" out of folder
  - UI transitions to Home Screen view
  - User can drop into:
    - Another folder
    - Or leave outside (removes from folder)

---

## 5. Folder View

### Entry
- Tap on folder

### Layout
- List of verses inside folder
- Button: "Add Verse to Folder"
- Button: "Practice Folder (Flashcards)"

---

### Add Verse to Folder Flow

#### Trigger
- Tap "Add Verse to Folder"

#### Prompt Options
- Add Existing Verse
- Add New Verse

---

### Add Existing Verse

#### UI
- List of all verses
- Search bar at top

#### Search Behavior
- Filters by book name (e.g., "Romans", "John")

#### Selection
- Selecting a verse adds it to the folder

---

### Add New Verse

#### Behavior
- Opens same UI as Home Screen verse creation

---

## 6. Folder Practice (Flashcards)

### Trigger
- "Practice Folder" button

### Behavior
- Flashcard session using all verses in folder

### Flashcard Types (Mixed)
- Type A: Show reference → user recalls verse
- Type B: Show verse → user recalls reference

### Interaction
- Tap to reveal answer
- Swipe or button:
  - Correct
  - Incorrect

---

## 7. Verse Testing Flow (Individual Practice)

### Structure
Each practice session consists of 3 rounds:

---

### Round 1: Full Visibility
- Entire verse is visible
- User types input (guided recall allowed)

---

### Round 2: Partial Visibility
- Some words hidden
- Others visible

---

### Round 3: Full Recall
- No words visible
- Only verse reference shown
- User must type full verse from memory

---

### End of Each Round
- User must enter:
  - Verse reference (e.g., "Romans 8:1")

---

### Validation
- Compare:
  - Verse input
  - Reference input

---

## 8. Editing & Deletion

### Applies To
- Verses
- Folders

### Access
- Via context menu (e.g., 3-dot menu or long press)

---

### Edit Options
- For Verse:
  - Edit text
  - Edit reference
- For Folder:
  - Edit name
  - Edit color

---

### Delete Behavior
- Confirmation prompt required

#### Folder Deletion
- Verses inside are NOT deleted
- They return to Home Screen

---

## 9. Data & State Expectations

### Verse Object
- id
- text
- reference
- folderId (nullable)

### Folder Object
- id
- name
- color

---

## 10. Interaction Rules Summary

- Tap → Open / Select
- Long Press → Drag / Context actions
- Drag → Move verses between folders or out to root
- FAB → Create new items
- Folder = container only (non-destructive)

---

## 11. Key UX Goals

- Fast access to practice
- Simple organization (drag + folders)
- Minimal friction when adding content
- Clear separation between:
  - Organization (Home)
  - Practice (Sessions)
