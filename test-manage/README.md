# Question Bank & Test Builder

An offline-capable tool for authoring exam/quiz questions (with
justifications for every option) and assembling them into tests. Built to
support writing multiple-choice questions in the "question + correct answer
+ wrong answers, each with a justification" style, tagging them by topic,
and composing tests out of a shared bank rather than writing each test's
questions from scratch.

## Goal

Course/exam authors accumulate a bank of MCQ items over time — often
covering the same source material (e.g. a case study) from different
angles (offensive, defensive, ethics, etc.). The goals of this tool are:

- Keep all authored questions in one reusable bank instead of scattered
  across separate test documents.
- Tag questions so a related batch (a topic, a case study, a difficulty
  level) can be pulled up on demand.
- Build multiple tests from that same bank, organizing each test's
  questions into named sections/groups (or leaving them ungrouped) via
  drag-and-drop.
- Let a question be corrected or improved without silently breaking every
  test that already uses it — edits are explicit, versioned, and warn when
  they'll affect other tests.
- Be entirely self-contained: no server, no account, so it can be opened
  locally, checked into a repo, or handed to someone else as a static
  folder.

## Intended functionality

**Question bank**
- Add/edit/delete questions: category, question text, one correct answer,
  any number of wrong answers, and a justification for every answer
  (correct and wrong).
- Free-form tags per question; click a tag to filter the bank to matching
  questions (any-tag-matches, not all-tags-required).
- Text search across category, question text, and tags.
- Multi-select via checkboxes for bulk actions: apply a tag to several
  questions at once, or add several questions to a test/group at once.
- Import a batch of questions from pasted JSON (category/question/answers/
  justification shape); export the whole bank (or just the current
  selection) back out to JSON.

**Test builder**
- Multiple named tests, each independent.
- Each test has an "ungrouped" bucket plus any number of named groups
  (sections). Questions can live loose in a test or inside a group.
- Drag a question (or a multi-selected batch) straight from the bank onto
  a test to add it — either into a specific group or into the ungrouped
  bucket. Drag rows within/between groups to reorder or move them.
- Remove a question from a test via a delete button on its row, or by
  dragging it back onto the bank panel.
- Reorder groups, rename groups/tests, delete groups/tests (with confirm).
- Export a single test's structure (name, groups, ungrouped questions,
  full question content) to JSON.

**Versioning / audit trail**
- Tests reference questions by a stable ID, not by copying their content.
- Editing an existing question offers two paths:
  - **Save as new version** — creates a new bank entry (new ID, version
    number bumped, linked to the original via `familyId`). If the edit was
    opened from a question's row inside a test, that specific slot's
    reference is swapped to the new version; every other test keeps
    pointing at the old one.
  - **Edit this version** — mutates the existing entry in place (same ID,
    version number bumped, prior content pushed onto its `history` array).
    Because this changes the question everywhere it's referenced, if any
    test/group currently uses it, a confirmation dialog lists exactly
    where before committing.
- Each question shows its version number; a history icon (when history
  exists) opens a read-only list of prior versions with timestamps.

**Backup**
- "Download backup" serializes the entire bank + all tests to a JSON file.
- "Load backup" reads one back in — applied immediately if the bank is
  currently empty, otherwise it asks for confirmation before replacing
  what's there.
- "Export questions" downloads just the questions array (selection if any
  is active, otherwise the whole bank) — for reuse outside this tool.
- "reset data" wipes the bank and every test. On the next load, an empty
  bank/test set is treated the same as a brand-new database and reseeds
  with the starter question set (this mirrors the pre-Elm version's
  behavior, which is not a from-scratch redesign choice).

## Architecture

**Stack:** [Elm](https://elm-lang.org/) (0.19) compiled to a single
`elm.js`, styled entirely with [Tailwind CSS](https://tailwindcss.com/)
(compiled ahead of time to `app.css` — no CDN, keeping the tool usable
offline). `index.html` is a thin shell that loads `app.css` and `elm.js`
and boots the Elm program into `#app`.

**Why Elm:** the original version of this tool was a single hand-rolled
`app.html` (vanilla JS, manual `innerHTML` re-rendering, `onclick`
attribute soup). It worked, but every new interaction meant more
hand-wired state/render bookkeeping. Elm's model/update/view keeps the
(fairly large) interaction surface — bank filtering, multi-select, drag
and drop across a nested test/group/loose structure, question versioning,
import/export, IndexedDB persistence — in one typed, exhaustively-checked
`update`, with the view as a pure function of `Model`.

**File layout:**
```
test-manage/
  index.html        — shell: loads app.css + elm.js, boots the Elm app
  app.css            — Tailwind, compiled ahead of time (npm run build:css)
  elm.js             — compiled Elm output (npm run build:elm)
  js/db.js           — the only hand-written JS: wires IndexedDB to Elm's
                        two ports (see "Persistence" below)
  src/
    Types.elm        — domain model (Question, Test, Group, Answer, ...)
    Codec.elm        — JSON encode/decode for that model (backups, the
                        IndexedDB blob, pasted-JSON import)
    Data.elm         — pure helpers: filtering, tag coloring, id
                        generation, moving a question between test slots,
                        the seed question bank
    Ports.elm        — the two ports, declared on their own
    Main.elm         — Model / Msg / update / view / subscriptions
  elm.json, package.json, tailwind.config.js — build config
```

**Persistence — a single pair of ports:** unlike a typical Elm+IndexedDB
app that wires one port per store/operation (`putQuestion`, `deleteTest`,
`bulkPutQuestions`, ...), this app uses exactly **one outgoing port**
(`saveToDb`) and **one incoming port** (`loadFromDb`). Every mutation that
should persist re-sends the *entire* app state — the question bank, every
test, and config (currently just the active test id) — as one JSON blob;
`js/db.js` writes it to a single IndexedDB record (`qbank-db` → object
store `state` → key `"root"`). On boot, `js/db.js` reads that one record
back and sends it up through `loadFromDb` (or `data: null` if the database
is empty/unavailable, which Elm treats as "seed the starter bank"). There
is no per-question or per-test message shape to keep in sync — `Codec.elm`
is the single place that knows the JSON shape on both ends.

This trades a little bit of write efficiency (every save re-writes
everything, not just the changed record) for a much smaller surface
between Elm and JS — the entire persistence contract is "here is the
whole state" / "here was the whole state", which is easy to reason about
and hard to get out of sync.

**File I/O without ports:** backups, question exports, and test exports
use [`elm/file`](https://package.elm-lang.org/packages/elm/file/latest/)
(`File.Download.string` for downloads, `File.Select.file` + `File.toString`
for loading a backup file) rather than a port — Elm has first-class support
for this, so no hand-written JS is needed for it.

**Drag and drop without ports or `dataTransfer`:** rather than serializing
drag payloads into `DataTransfer` (as the original app did, since it had no
other way to carry state across a drag), the currently-dragged
question id(s) live directly in `Model.dragging`. `dragstart` just records
what's being dragged; `drop` reads it back from the model. This needed no
ports at all — it's plain Elm state.

## Rebuilding

```sh
npm install      # once, installs the elm and tailwindcss dev tools
npm run build    # compiles src/Main.elm -> elm.js and src/input.css -> app.css
```

`npm run watch:css` re-compiles `app.css` on save while iterating on
Tailwind classes in `src/*.elm`; there's no equivalent Elm watcher wired up
here, re-run `npm run build:elm` (or `npm run build`) after Elm changes.

Then just open `index.html` in a browser (or serve the folder statically —
either works, nothing here depends on a particular origin).

## Known limitations / possible next steps

- **Single user, no concurrency handling.** IndexedDB here is local to one
  browser profile; there's no sync, no multi-device story beyond the
  backup file.
- **No undo.** Deletes and overwrites are immediate (guarded only by the
  inline confirm UI, not a real undo stack).
- **No diff view for versions** — the history modal shows full snapshots,
  not a highlighted diff between them.
- **No connection yet to the existing AMC-TXT/ZipGrade export pipeline**
  (the other exam-authoring tool, `docs/index.html`) — the "Export JSON"
  per-test output is a reasonable starting shape for a future converter,
  but nothing reads it back in that direction yet.
- **Tag filtering is OR-based** (any selected tag matches), not AND —
  fine for browsing, but there's no way to narrow to "must have both tag
  A and tag B" today.
