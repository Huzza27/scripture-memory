# Scripture Memory App – Memory Testing System Spec

## 1. Overview

The memory system is built around **progressive recall**, **flashcard training**, and **AI-assisted reinforcement (songs)**.

### Core Goals

* Reinforce memorization through **graduated difficulty**
* Support **bidirectional recall** (verse → reference, reference → verse)
* Introduce **audio/musical memory hooks**
* Track progress and adapt difficulty dynamically

---

## 2. Data Model

### Verse Object

```json
{
  "id": "string",
  "reference": "Romans 8:1",
  "text": "There is therefore now no condemnation for those who are in Christ Jesus.",
  "tokens": ["There", "is", "therefore", "..."],
  "normalized_tokens": ["there", "is", "therefore", "..."]
}
```

### User Progress

```json
{
  "user_id": "string",
  "verse_id": "string",
  "stage": 1,
  "accuracy": 0.85,
  "last_attempt": "timestamp",
  "streak": 3,
  "mastered": false
}
```

---

## 3. Core Mode: Progressive Recall Testing

### 3.1 Stages

#### Stage 1 – Guided Input (Full Verse Visible)

* UI shows full verse
* User types **first letter of each word**

Example — Verse:
> "For God so loved the world"

Expected input:
```
f g s l t w
```

Validation Logic:
```pseudo
for i in range(len(tokens)):
    if user_input[i] != tokens[i][0]:
        mark incorrect
```

---

#### Stage 2 – Partial Hidden

* Randomly hide ~40–70% of words
* Show blanks or underscores

Example:
```
For ____ so loved ___ world
```

* User still inputs first letters
* Visible words act as hints

---

#### Stage 3 – Full Recall

* Entire verse hidden
* Only reference shown

User must:
* Input full sequence of first letters

Optional:
* Allow full typing mode toggle (advanced users)

---

### 3.2 Stage Progression Logic

```pseudo
if accuracy >= 90% for 2 consecutive attempts:
    advance stage
else if accuracy < 60%:
    regress stage (optional)
```

---

### 3.3 Input Handling

**Normalize Input:**
* Lowercase
* Ignore punctuation
* Collapse multiple spaces

**Token Matching:**
* Strip punctuation from tokens
* Example: `"world," → "world"`

---

## 4. Flashcard System

### 4.1 Modes

**Mode A – Reference → Verse**
* Prompt: `"Romans 8:1"`
* User recalls verse mentally
* Next card reveals answer

**Mode B – Verse → Reference**
* Prompt: `"For God so loved the world..."`
* User selects or types reference

---

### 4.2 Interaction Flow

```pseudo
show_card()
wait_for_user_recall()
on_next():
    show_answer()
    user_rates_self(again, hard, good, easy)
```

---

### 4.3 Spaced Repetition (Simple Version)

```pseudo
if rating == "easy":
    next_review = now + 3 days
elif rating == "good":
    next_review = now + 1 day
elif rating == "hard":
    next_review = now + 6 hours
else:
    next_review = now + 10 minutes
```

---

## 5. AI Song Integration (Key Differentiator)

### 5.1 Goal

Generate **short, catchy, repeatable audio hooks** for verses.

---

### 5.2 Song Object

```json
{
  "verse_id": "string",
  "lyrics": "For God so loved the world...",
  "style": "upbeat pop / chant / hymn",
  "audio_url": "string",
  "tempo": 90
}
```

---

### 5.3 Integration Modes

**Mode A – Passive Learning**
* Play song during idle or review
* Loop short segments (5–15 sec)

**Mode B – Fill-in-the-Lyric**

Audio plays:
> "For God so loved the ___"

User must input:
```
w
```

**Mode C – Rhythm Recall**
* Words appear in rhythm timing
* User taps or types in sync

---

### 5.4 AI Generation Pipeline

```pseudo
input: verse_text
→ compress phrasing (optional)
→ choose style (user preference)
→ generate melody + lyrics
→ export short loop (mp3)
```

---

## 6. Scoring System

### Accuracy Calculation

```pseudo
accuracy = correct_letters / total_words
```

### Bonus Metrics

* Speed (time to complete)
* Streaks
* First-try success

---

## 7. UX Flow

### Session Loop

```pseudo
select verses
→ choose mode (test / flashcard / song)
→ run session
→ show results
→ update progress
```

---

## 8. Advanced Features (Optional)

### 8.1 Smart Word Difficulty

* Track which words user misses
* Highlight or prioritize them

### 8.2 Adaptive Hiding

* Hide words user struggles with less
* Increase difficulty on mastered words

### 8.3 Typing Full Verse Mode

* Toggle for advanced memorization
* Compare full string similarity

---

## 9. Edge Cases

* Hyphenated words → treat as one token
* Apostrophes → normalize (`God's → gods`)
* Verses with numbers → allow numeric or word input

---

## 10. Minimal MVP Scope

### Build first:

1. Stage 1–3 progressive recall
2. Flashcards (both directions)
3. Basic scoring

### Then add:

4. Song playback
5. Lyric-fill mode
6. Spaced repetition

---

## 11. Core Validator (Reference Implementation)

```pseudo
function validateFirstLetterInput(tokens, user_input):
    correct = 0
    for i in range(len(tokens)):
        if user_input[i] == tokens[i][0]:
            correct += 1
    return correct / len(tokens)
```

---

## 12. Key Differentiator Summary

* AI-generated **earworm songs** (ElevenLabs integration — see ELEVENLABS_INTEGRATION.md)
* **Multi-modal memory** (visual + auditory)
* **Bidirectional recall training**
* **Progressive difficulty system**
