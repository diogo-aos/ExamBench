## 1. Overview of the workflow

Exam Bench takes you from a plain-text question bank all the way to a
set of printable, ZipGrade-ready exam versions — writing, shuffling,
and filling the final `.odt` documents all happen **in one app, in
your browser**. Nothing you type or upload leaves your machine except
the files you explicitly download.

The steps, in order:

1. Write questions in the left-hand editor, using the AMC-TXT subset
   described in Section 2.
2. Optionally batch-edit scores and penalties (Section 3).
3. Optionally group related questions together (Section 2.4).
4. Open **Versions**, choose how many versions and how shuffling
   should behave — versions rebuild automatically as you change these
   (Section 4).
5. In the same panel, pick an ODT template (a built-in one, or upload
   your own) — Section 5.
6. Click **Generate output docs** to fill and preview the ODTs, or
   **Download all** to get everything as one `.zip` (Section 6).
7. Import the CSV from that zip into ZipGrade as the quiz's answer key
   (Section 7).

## 2. Writing questions — AMC-TXT (a subset)

Exam Bench's editor accepts a **subset of AMC-TXT**, the plain-text
question format used by Auto Multiple Choice. It is not the full
AMC-TXT language — only the parts needed for single-answer multiple
choice exams are implemented. Section 2.5 lists exactly what is and
isn't supported.

### 2.1 A basic question

```
*[id=osi-01]{b=2,m=-0.5} At which OSI layer does a TLS session terminate?
+ Presentation
- Network
- Data link
- Physical
```

- A line starting with `*` begins a new question.
- A line starting with `+` is the single correct choice.
- A line starting with `-` is a wrong choice.
- A question needs at least one choice, exactly one `+`, and at most
  five choices total (ZipGrade's standard bubble sheet holds A–E).
- A line that starts with none of `* + -` and isn't blank continues
  the text above it — useful for wrapping long question or choice text
  across lines.

### 2.2 Optional tags and scoring

Right after the `*`, two optional bracketed groups may appear, in this
order:

```
*[id=nav-01]{b=2,m=-0.5} Question text
```

- `[id=...]` — a short identifier, reused as the question's tag in the
  ZipGrade CSV. If omitted, the question has no tag.
- `{b=2,m=-0.5}` — scoring: `b` is the points awarded for a correct
  answer (default `1` if omitted), `m` is the points *lost* for a
  wrong answer (default `0`). `{2}` alone is shorthand for `{b=2}`.

### 2.3 Metadata

A small set of `Key: value` lines, placed before the first question,
sets document metadata:

```
Title: Cyber Warfare — Mid-term
Presentation: 15 questions, 90 minutes, no materials.
Author: CIAFA
```

`Title` and `Presentation` appear at the top of the question preview.
Any other key is accepted and stored but not currently displayed.

### 2.4 Question groups

Related questions can be wrapped in a group, which keeps them together
— with shared introductory and closing text — through shuffling,
preview, and printing:

```
*( Questions about the Enigma machine.
* What kind of cipher device was the Enigma?
+ Electromechanical rotor cipher
- Digital block cipher
- One-time pad generator
* Who led the British effort to break Enigma at Bletchley Park?
+ Alan Turing
- Winston Churchill
- Claude Shannon
*) End of Enigma questions.
```

- `*(` opens a group; any text after it is the group's introduction.
- `*)` closes it; any text after it is the group's closing note
  (optional — the line can simply be `*)`).
- Every group must be closed. An unclosed group, or a stray `*)`, is
  flagged as an error in the Problems panel.
- Groups cannot be nested.
- A group can optionally carry its own `[id=...]`, e.g.
  `*([id=enigma] Intro text`. If omitted, it's auto-numbered `g1`,
  `g2`, ...

### 2.5 What this subset supports — and what it doesn't

**Supports:**

| Feature | Syntax |
|---|---|
| Single-answer multiple choice | `*` question, `+`/`-` choices |
| Up to 5 choices per question | (ZipGrade standard sheet limit) |
| Per-question score and penalty | `{b=…,m=…}` |
| Question tags | `[id=…]` |
| Question groups with intro/outro text | `*( … *)` |
| Document title and free-form metadata | `Key: value` lines |
| Line continuation | any unprefixed, non-blank line |
| Comments | lines starting with `#` |

**Does *not* support** (full AMC-TXT and AMC itself have all of these;
Exam Bench does not):

- Multiple-correct-answer questions (AMC-TXT's `**`) — Exam Bench
  detects `**` and treats it as a warning, grading it as
  single-answer.
- Open-ended / free-text questions.
- LaTeX math or any LaTeX commands.
- Images or other embedded media.
- Nested groups.
- AMC's box/answer-sheet layout directives, page-layout commands, or
  scoring-strategy declarations beyond per-question `b`/`m`.
- Alternate answer keys / multiple correct-answer mappings for the
  same question.

If a bank uses any of the unsupported features, simplify it to plain
single-answer questions before pasting it in — see Section 8 for using
an AI assistant to help with that conversion.

## 3. Batch scoring tools

Open the **Scoring** panel to edit every question's score or penalty
at once, without hand-editing each line:

- **Score — all questions**: sets every question's `b` to one value.
- **Penalty — all questions**: three one-click presets (`0`,
  `25% of score`, `50% of score`, each computed from that question's
  *current* score) plus a custom fixed value.
- **Normalize total**: rescales every score proportionally so the
  whole bank sums to a target (quick buttons for 20 and 100, or a
  custom value).

All three tools rewrite the `{b=…,m=…}` braces directly in the source
text — the text stays the single source of truth, and the result is
visible immediately in the editor. Applying any of them clears any
already-generated versions, since their scores would otherwise be
stale; reopening **Versions** rebuilds them automatically.

## 4. Generating versions

Open **Versions** to build shuffled variants of the bank (default: 3,
lettered A, B, C). Versions rebuild the moment you open the panel or
change any of these settings — there's no separate "Generate" button
to remember to click.

| Setting | Effect |
|---|---|
| How many | Number of versions to generate (A, B, C, ...) |
| Shuffle seed | Same seed always rebuilds identical versions — change it to get a different shuffle |
| Shuffle questions & groups | Reorders standalone questions and whole groups relative to each other. A group always stays together and in one contiguous block — this is the "shuffle between groups" control |
| Shuffle within groups | Separately controls whether the questions *inside* each group get reordered. Off keeps each group's internal sequence exactly as written |
| Shuffle choices | Reorders each question's answer choices independently per version |

Each version's card shows every question as a small chip, e.g. **g1 ·
Q3 · A** — the group id (if any), the question's number in the
original bank, and the correct answer letter for that version — so
you can sanity-check the shuffle without a full question dump.

This is deliberately the *cheap* part: rebuilding versions and their
preview never fetches a template or fills any documents — that only
happens when you ask for it (Section 6).

## 5. ODT templates

Below the version cards, the **ODT TEMPLATE** section is where you
pick what the final printable documents look like.

### 5.1 Built-in templates

Exam Bench ships with a small set of default templates (currently
`01_generic.odt` and `02_AFA_IAFS_CyberWarfare_Test.odt`), listed in
order with the first one pre-selected. Each has its own **download**
button if you just want a copy of the raw template file (e.g. to edit
it in LibreOffice and re-upload your own version).

### 5.2 Uploading your own template

Click **upload custom .odt(s)** to add one or more of your own
templates — you can select multiple files at once. Each upload:

- appears in the list marked **(custom)**, and stays there even after
  you switch to a different template — switching selection never
  removes an uploaded template, only an explicit **remove** click
  does;
- is saved in your browser's local storage (IndexedDB), so it **survives
  a page refresh** — you don't need to re-upload it next time;
- is never sent anywhere; it's read directly by your browser and only
  ever leaves your machine if you download a file that used it.

Only one template is *selected* (the one that gets filled) at a time
— pick it with the radio button next to its name.

### 5.3 Template placeholder format

A template is a normal `.odt` file (built in LibreOffice Writer) with
placeholders that Exam Bench fills in per version:

```
Test — Version {version}

Questions
{#mcq}
Q {question_number} [{question_score} val., -{question_penalty} pen.].  {question_text}
{#options}
    {option_number}. {option_text}
{/options}
--------------------------------------------------------------------
{/mcq}
```

- `{#mcq}…{/mcq}` is a repeating block — it's duplicated once per
  question in that version, with `{question_number}`,
  `{question_text}`, `{question_score}`, and `{question_penalty}`
  filled in for each.
- `{#options}…{/options}`, nested inside `{#mcq}`, repeats once per
  answer choice, filling `{option_number}` and `{option_text}`.
- `{version}` outside those blocks is replaced with the version
  letter (A, B, C, ...).

Two things worth knowing before designing your own template:

- **No correct-answer flag.** The data filled into the template
  deliberately does not mark which option is correct — that only
  lives in the CSV (Section 7), so a printed exam can never
  accidentally leak the answer key.
- **No group information yet.** A group's shared intro/outro text,
  and which questions belong to it, aren't currently passed into the
  template fill — each question is filled independently. If your
  template needs a group's introductory text printed once above its
  questions, that isn't automated yet.

### 5.4 If the default templates aren't reachable

The built-in templates are fetched from this app's own GitHub
repository. If that fails (offline, GitHub unreachable), the panel
tells you only uploaded templates are available — upload one and pick
it, and everything else works exactly the same.

## 6. Generating and downloading your exam pack

Filling ODT templates is the one genuinely expensive step in Exam
Bench — it only happens when you explicitly ask for it, via one of two
buttons next to **FILES**:

- **Generate output docs** — fills every version against the
  currently selected template and lists the results right there in
  the panel, each with its own **save** button. Useful for previewing
  or grabbing files one at a time if your browser blocks multi-file
  downloads.
- **Download all** — does the same fill (if it hasn't already run for
  the current versions/template), then bundles everything into one
  `<slug>-exam-pack.zip` containing:
  - `<slug>-zipgrade-keys.csv` — the answer key for **every** version,
    in ZipGrade's import format (Section 7).
  - `<slug>-version-A.odt`, `-B.odt`, ... — one filled, printable
    document per version.
  - `<slug>-answer-keys.md` — a human-readable answer key table for
    all versions, for your own reference.

If any single version fails to fill (usually a template that doesn't
match the expected placeholder structure), the whole batch is stopped
with an error rather than silently shipping a partial set — a failure
on one version almost always means every version would fail the same
way, so fix the template (or pick a different one) and try again.

## 7. Importing the CSV into ZipGrade

The exported CSV follows ZipGrade's answer-key import format: one row
per question response, columns
`Key, Question, Response/Mapping, Points, Tags`.

- `Key` is the version letter (A, B, C, ...).
- A penalty is written as a **second row** for that question, with
  `Response/Mapping` set to the literal `[a&i]` (ZipGrade's "attempted
  but incorrect" point value) and `Points` set to the penalty amount.
- The file always contains every version's key together — importing
  it replaces the quiz's entire answer key, so keep all versions in
  one import rather than importing them one at a time.

## 8. Using AI to convert an existing question bank

If you already have questions in another format — a Word document, a
spreadsheet, a PDF, a different quiz tool's export — an AI assistant
can usually convert them to this AMC-TXT subset quickly. A few things
make that conversion go smoothly:

**Give the assistant the exact grammar, not just an example.** A model
shown only one sample question will often improvise syntax that looks
plausible but isn't actually supported here — brackets in the wrong
order, invented fields, or multi-line choices without a leading `-`.
The prompt below spells out the grammar with examples, so nothing is
left to guesswork.

**Ready-to-use prompt** — copy the whole block, paste it into your AI
assistant, and attach or paste your source question bank after it:

````{.prompt}
You are converting a question bank into a plain-text format called
AMC-TXT (a restricted subset). Follow this grammar exactly — do not
invent syntax, fields, or formatting beyond what's described here.

FORMAT RULES
- A line starting with `*` begins a new question, followed by the
  question text.
- A line starting with `+` is a correct choice; a line starting with
  `-` is a wrong choice. Each question needs exactly one `+` and at
  most 5 choices total (`+` and `-` combined).
- A line that doesn't start with `*`, `+`, `-`, or `#`, and isn't
  blank, continues the text of the line above it (for wrapping long
  text across lines).
- A blank line ends the current question.
- Lines starting with `#` are comments and are ignored.
- Optional, right after the `*` and before the question text:
  `[id=...]` (a short tag) and/or `{b=SCORE,m=PENALTY}` (points for a
  correct answer, points lost for a wrong one — both optional, default
  b=1, m=0). Example: `*[id=osi-01]{b=2,m=-0.5} Question text`.
- Optional metadata lines before the very first question, one per
  line: `Title: ...`, `Presentation: ...`, `Author: ...` (or any
  `Key: value`).
- Optional groups: `*( intro text` opens a group, `*) outro text`
  closes it. Every group opened must be closed. Groups cannot be
  nested. Questions inside a group are still written with `*` exactly
  like any other question.

EXAMPLE — basic question:
*[id=osi-01]{b=2,m=-0.5} At which OSI layer does a TLS session terminate?
+ Presentation
- Network
- Data link
- Physical

EXAMPLE — metadata + a plain question (no id/scoring needed):
Title: Cyber Warfare — Mid-term
Presentation: 15 questions, 90 minutes, no materials.

* Which technique gathers information without touching the target?
+ Passive reconnaissance
- Port scanning
- Banner grabbing

EXAMPLE — a group of related questions:
*( Questions about the Enigma machine.
* What kind of cipher device was the Enigma?
+ Electromechanical rotor cipher
- Digital block cipher
- One-time pad generator
* Who led the British effort to break Enigma at Bletchley Park?
+ Alan Turing
- Winston Churchill
- Claude Shannon
*) End of Enigma questions.

CONSTRAINTS
- Single correct answer only — never "select all that apply."
- Maximum 5 choices per question.
- No LaTeX, no images, no tables inside a question.
- Every group opened with `*(` must be closed with `*)`.

YOUR TASK
Convert the attached/pasted question bank into this format. Do not add
scoring braces, IDs, or groups unless I ask for them — keep it as
plain `*`/`+`/`-` questions unless the source clearly needs a group.
Leave a blank line between questions.

If a question has more than one correct answer, is open-ended, or
depends on an image, diagram, or table that can't be described in
plain text, do NOT guess at a conversion — list it separately at the
end under a "COULD NOT CONVERT" heading with a short reason.
````

That last instruction matters — it's much easier to review a short
list of flagged questions and handle them by hand than to discover a
silently mis-converted question during a live exam.

**After conversion, always:**

1. Paste the result into Exam Bench and check the Problems panel for
   errors before doing anything else.
2. Skim the preview pane — a wrong answer marked as correct, or a
   truncated choice, is easy for both a human and a model to miss on
   a quick read.
3. Spot-check the choice count on questions that originally had more
   than 5 options — the model may have dropped one silently rather
   than flagging it, if it wasn't told not to.
