# Question Bank & Test Builder

A single-file, offline-capable tool for authoring exam/quiz questions (with
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
- Be entirely self-contained: no server, no account, no build step, so it
  can be opened locally, checked into a repo, or handed to someone else as
  a single file.

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

## Current architecture

**Format:** one `.html` file. No build step, no bundler, no external
script/CSS dependencies (fonts, icons, and colors are all plain CSS —
no CDN calls). Meant to be opened directly in a browser or self-hosted
as a static file.

**Stack:** vanilla JS (no framework). All rendering is done by generating
HTML strings from the current in-memory state and setting `.innerHTML` on
specific container elements — there's no virtual DOM or diffing. Event
handling is done entirely through inline `onclick`/`oninput`/`ondragstart`
/`ondragover`/`ondrop` attributes calling globally-scoped functions
(the script is a classic `<script>` tag, not a module, so top-level
`function` declarations are reachable from those inline attributes).

**Storage:** the browser's IndexedDB, database `qbank-db`, two object
stores:
- `questions` (keyPath `id`)
- `tests` (keyPath `id`)

Every mutation updates the in-memory `questions`/`tests` arrays and then
persists the affected record(s) with `put`/`delete` on the relevant store
— there's no single "save everything" blob. A `migrateData()` function
normalizes records on load (and on backup import), filling in any fields
missing from an older shape, so the schema can grow without a hard
migration step.

**Data model:**

```
question = {
  id, familyId, version, history: [snapshot...], updatedAt,
  category, text,
  correct: { text, justification },
  wrong: [{ text, justification }, ...],
  tags: [string, ...],
}

test = {
  id, name,
  looseQuestionIds: [questionId, ...],
  groups: [{ id, name, questionIds: [questionId, ...] }, ...],
}
```

Tests only ever store question **IDs** — never a copy of question content
— which is what makes the versioning/reference-warning behavior possible
(you can always ask "which tests currently point at this ID").

**Rendering approach:** the page has a handful of stable container
elements (`#header-root`, `#tag-chips`, `#bulk-toolbar`, `#bank-list`,
`#test-tabs`, `#test-actions`, `#test-content`, `#modal-root`). A change
to state calls a small `refresh*()` function that re-renders only the
relevant container(s), rather than the whole page — this keeps unrelated
inputs (like the search box) from losing focus/cursor position when
something elsewhere changes. Text fields that don't need to trigger a
re-render (form fields, rename inputs, the bulk-tag input) update a plain
JS variable via `oninput` without calling any render function; the DOM
node the user is typing into is simply left alone. Drag-over highlighting
is done by toggling a CSS class directly on the hovered element rather
than re-rendering, since replacing the DOM node under an active drag
would break the drag operation.

**File layout inside the single `<script>` block** (roughly top to
bottom): small pure helpers (`uid`, `esc`, `downloadJSON`) → data-shape
helpers (`migrateData`, `snapshotOf`, `findReferences`,
`withQuestionRemoved`) → seed data → the IndexedDB wrapper functions →
module-level state variables → `init()` → render orchestration
(`renderAll`/`refresh*`) → bank panel (render + handlers) → test builder
panel (render + handlers) → question form/versioning logic → import
modal → backup/reset logic.

## Known limitations / possible next steps

- **Single user, no concurrency handling.** IndexedDB here is local to one
  browser profile; there's no sync, no multi-device story beyond the
  backup file.
- **No undo.** Deletes and overwrites are immediate (guarded only by the
  inline confirm UI, not a real undo stack).
- **Rename-on-blur, not live.** Test/group name edits commit on blur or
  Enter rather than updating character-by-character, a deliberate
  trade-off to avoid re-rendering the input the user is actively typing
  in.
- **No diff view for versions** — the history modal shows full snapshots,
  not a highlighted diff between them.
- **No connection yet to the existing AMC-TXT/ZipGrade export pipeline**
  (the other exam-authoring tool) — the "Export JSON" per-test output is
  a reasonable starting shape for a future converter, but nothing reads
  it back in that direction yet.
- **Tag filtering is OR-based** (any selected tag matches), not AND —
  fine for browsing, but there's no way to narrow to "must have both tag
  A and tag B" today.
