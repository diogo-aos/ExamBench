# ExamBench — Architecture

A single self-contained HTML app. No build step, no bundler, no
backend — everything runs client-side in the browser.

**Deployment:** `docs/` is the GitHub Pages deployment root for this
repo. `docs/index.html` is the app itself — a real file (not a
symlink; GitHub Pages/browsers don't reliably follow symlinks, so an
earlier symlink-based approach was replaced with a plain copy) and the
single source of truth for the app's code. There is no longer a
separate copy at the repo root.

Exam Bench fills ODT templates itself, in-app (see the `Templates`
module and `App`'s Versions modal below) and exports finished `.odt`
files directly, with no JSON hand-off step. A previous companion tool,
`odt-template-filler.html` (fill an ODT from externally-produced JSON),
has been removed from the repo — Exam Bench's in-app filling covers
that need now.

## `docs/index.html` — MCQ question bank + ODT export tool

Tailwind-compiled CSS (pre-built, pasted into `<style>`) + vanilla JS.
All logic lives in one non-module `<script>` block (~L228-1400),
organized as sequential IIFE modules:

1. **`AMCParser`** (~L222) — parses the custom "AMC-TXT" plain-text format
   into question objects, line by line via regex:
   - `Title:` / `Key: value` → metadata (only above the first question)
   - `*[id=..]{b=2,m=-0.5} text` → starts a question (`b`=points,
     `m`=penalty, `[id]` optional tag reused as the ZipGrade tag)
   - `+`/`-` lines → correct/wrong choices
   - `*( ... *)` → a group of questions that always shuffles as one unit
   - unprefixed lines continue the previous line; `#` = comment
   - emits `problems[]` (errors/warnings): no correct choice, >5 choices
     (ZipGrade standard-form limit `MAX_CHOICES`), unclosed group, etc.
   - `parse()` returns `{ meta, questions, problems, blocks, groups, ok }`

2. **`Store`** (~L367) — IndexedDB persistence. Autosaves editor source +
   settings on a 500ms debounce (`scheduleSave`), restored on load.

2b. **`CustomTemplates`** (~L405) — separate IndexedDB database
   (`exam-bench-templates`, distinct from `Store`'s DB — different
   lifecycle/shape: arbitrary-sized binary blobs vs. one app-state
   record) persisting user-uploaded `.odt` templates so they survive a
   page refresh. `{ id, name, bytes }` records in an `autoIncrement`
   object store; `list()`/`add(name, bytes)`/`remove(id)`. `App` keeps
   its own in-memory mirror (`customTemplates`) loaded once on `init()`
   and kept in sync on every add/remove — this module itself holds no
   app state, it's purely the persistence layer.

3. **`Rand`** (~L398) — seeded RNG: FNV-1a string hash → mulberry32 PRNG.
   Same seed always reproduces the same shuffle (Fisher–Yates).

4. **`Versions`** (~L425) — builds N shuffled exam versions (letters
   A, B, C…) from `parsed.blocks`. Three independent shuffle toggles:
   reorder top-level questions/groups, reorder within a group, reorder
   choices. Invalid questions/empty groups are dropped before shuffling
   (`prepareBlocks`).

5. **`ScoreOps`** (~L481) — batch scoring edits (set score, set penalty
   fixed/%, normalize to a target point total). Important design choice:
   these **rewrite the `{b=…,m=…}` brace on the source line directly** —
   the textarea/source text is the single source of truth, there is no
   separate score state to keep in sync.

6. **`Exporters`** (~L542) — output formats:
   - ZipGrade answer-key CSV (`Key, Question, Response/Mapping, Points, Tags`;
     a penalty becomes an extra `[a&i]` row — ZipGrade's "attempted but
     incorrect" point value)
   - `versionData(version)` — a plain per-version object (`{ version,
     mcq: [{ question_number, question_text, question_score,
     question_penalty, options: [{option_number, option_text}] }] }`)
     passed **directly** to `odf-kit`'s `fillTemplate()` — no JSON
     stringify/file round-trip, this is purely an in-memory data shape
     now (was `versionJson()`, which wrote a `.json` file; removed once
     filling moved in-app)
   - a combined Markdown answer key (pandoc-friendly frontmatter)

7. **`Templates`** (~L614) — fetches default ODT templates from
   `templates/` (a **relative path**, resolved against the page's own
   URL — `docs/templates/`, a sibling of `docs/index.html`, both served
   by GitHub Pages from the same origin/root; see "Templates" below)
   and lazily loads `odf-kit`. Laziness/caching rules (deliberate, not
   incidental):
   - `listNames()` fetches `templates/list.txt` once and caches the
     names forever on success; a failed attempt is **not** cached, so
     the next call retries (transient network blips don't permanently
     break the picker).
   - `.odt` bytes are **never** prefetched for the whole list — only
     `selectBytes(name)` (the active selection) or `downloadBytes(name)`
     (an explicit per-row download click) fetch actual template bytes.
   - `selectBytes` holds a **single-slot** cache (`{name, bytes}`, not a
     map) — `evictSelected()` is called on every selection change, so
     only the currently-active default template's bytes stay resident.
   - `downloadBytes(name)` reuses that single-slot cache opportunistically
     (if the requested name matches the current selection) but never
     grows or replaces it — an ephemeral download for some *other*
     listed template is fetched and handed off without being retained.
   - `loadFillTemplate()` dynamically `import()`s
     `https://esm.sh/odf-kit@latest` the first time it's actually
     needed (a plain, non-`type="module"` `<script>` can still use
     dynamic `import()`), and caches the resolved function.
   - Errors are tagged (`err.kind`): `'template-source'` for
     `list.txt`/`.odt` fetch failures (→ "only uploaded ODT templates
     are available right now"), `'odf-kit'` for the module failing to
     load (→ "the component for rendering the final ODTs is
     unavailable") — `App` uses this to show the right message.

8. **`Zip`** (~L676) — hand-rolled, dependency-free stored-mode (no
   compression) ZIP writer: manual CRC32 table + DataView binary layout
   for local file headers / central directory / EOCD. Accepts either
   `{name, text}` (string, UTF-8 encoded) or `{name, bytes}`
   (pre-encoded `Uint8Array`, used for the filled `.odt` entries) per
   file. No external libs (no fflate).

9. **`Download`** (~L746) — blob-download helper with `openTab` and
   clipboard-copy fallbacks for when the browser blocks multiple
   auto-downloads.

10. **`Theme`** (~L775) — light/dark toggle persisted to localStorage,
    applied pre-paint via an inline `<script>` in `<head>` to avoid a
    flash of the wrong theme.

11. **`Preview`** (~L802) — renders the live "paper" preview pane
    (right side) from `parsed`.

12. **`Problems`** (~L894) — renders parser diagnostics under the editor.

13. **`App`** (~L911) — wiring/controller: editor `input` → reparse →
    refresh preview/problems → autosave. There is no header "Export"
    button anymore — the header's only action button is "Versions"
    (styled `.btn-primary`, the accent/gold color, so it stands out as
    the app's one entry point now that Export is gone). Everything else
    lives in the Versions modal: settings (count/seed/shuffle toggles,
    versions regenerate automatically on `change` — there's no
    "Generate" button either, since a manual trigger would be
    redundant), version chips, an "ODT TEMPLATE" picker section (default
    templates from `Templates.listNames()`, plus any user-uploaded
    custom templates, all in one radio list — see below), and a FILES
    panel with "Generate output docs" (`.btn-primary`, the same accent
    style the old standalone "Generate" button used — now the modal's
    one deliberately-heavy action) and "Download all" (`.btn-neutral`)
    next to the FILES label. The Scoring modal is separate (apply
    score/penalty/normalize, which call `ScoreOps` and rewrite
    `editor.value`).

    Template selection is tracked as `tplSelection` (`{kind:'none'}` |
    `{kind:'default', name}` | `{kind:'custom', id}`), resolved lazily
    by `resolveTemplateBytes()` — this is the single place that decides
    what bytes to fill with, and works even if the picker was never
    opened (falls back to a restored selection via `pendingSelection`,
    or `list.txt`'s first entry). **Uploaded custom templates are not
    part of `tplSelection` itself** — they live in `customTemplates`
    (`[{id, name, bytes}]`, mirrored from `CustomTemplates`/IndexedDB),
    and stay in that list — and in the picker — regardless of which
    template is currently selected; only an explicit "remove" click
    (`removeCustomTemplate(id)`) drops one, from both the in-memory list
    and IndexedDB. `handleCustomUpload(files)` accepts multiple files at
    once (the file input has `multiple`), persists each to
    `CustomTemplates.add()`, and selects the last one uploaded; a
    template whose IndexedDB write fails still gets a (non-persistent)
    local id via `localTemplateId()` so it's usable for the rest of the
    session. IDs round-trip through the DOM as `data-id` (always a
    string) — `parseTplId()` reconstructs the original type (`Number`
    for real IndexedDB keys, left as-is for the `local-…` fallback
    strings) before comparing, since `IDBObjectStore.delete()` and
    strict-equality lookups are key-type sensitive. Filling is
    **all-or-nothing**: `fillAllVersions()` calls `fillTemplate()` once
    per version and aborts the whole batch on the first failure (a
    per-version failure almost always means a structural template/data
    mismatch, not a fluke — so there's no partial-success bookkeeping).

    **Filling is deliberately deferred**, since it's the expensive step
    (a template fetch + `odf-kit` load + one `fillTemplate()` call per
    version): changing shuffle settings/seed/count, or the template
    selection, only rebuilds the cheap, JSON-level `versions` array and
    re-renders the version chips + CSV/MD preview
    (`generate()`/`renderVersions()` → `resetOutputDocs()`, which just
    resets the FILES panel's ODT rows to an "idle" placeholder — no
    fetch, no `fillTemplate()` call). The actual fill only runs on an
    explicit action: "Generate output docs" (`generateOutputDocs()`,
    paints pending → ready/error into the FILES panel) or "Download all"
    (`downloadAll()`, which resolves the template, loads `odf-kit`,
    fills every version, and zips `buildStaticFiles()` + the filled
    `.odt`s into one `slug()-exam-pack.zip` — no `.json` files are
    produced anymore). Both async paths share an `odtBuildToken` race
    guard so a stale run (superseded by a newer settings change or
    another generate/download click) can't clobber a newer one's UI
    state.

### Data flow
```
editor textarea → AMCParser.parse() → parsed{meta,questions,blocks,problems}
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                      Preview.render   Problems.render   Versions.build (settings change, automatic)
                                                                │
                                                     resetOutputDocs (cheap: CSV/MD + idle ODT placeholder)
                                                                │
                                    ┄┄┄ explicit click: "Generate output docs" / "Download all" ┄┄┄
                                                                │
                              ┌─────────────────────────────────┤
                              ▼                                 ▼
                   buildStaticFiles (CSV / MD)      resolveTemplateBytes (Templates)
                              │                                 │
                              │                    Templates.loadFillTemplate (odf-kit)
                              │                                 │
                              │                 fillAllVersions: Exporters.versionData(v)
                              │                        → fillTemplate(bytes, data) → .odt
                              │                                 │
                              └───────────────┬─────────────────┘
                                               ▼
                                  Zip.build → Download.blob (.zip)
```

## Templates

Templates exist in **two places** in the repo, and they are plain
copies, not symlinks (GitHub Pages/browsers don't reliably serve
symlinked files):
- `templates/` (repo root) — the source of truth. `templates/README.md`
  documents the placeholder convention (`{#mcq}…{/mcq}` /
  `{#options}…{/options}`); `templates/list.txt` is one `.odt` filename
  per line.
- `docs/templates/` — a copy of the same `list.txt` + `.odt` files,
  needed because `docs/` is what GitHub Pages actually serves.
  `docs/index.html` fetches from `templates/` as a **relative path**
  (resolves to `docs/templates/` at runtime, same-origin, no CORS or
  cross-repo network round-trip), so this copy must exist and stay in
  sync for the picker to work when deployed.

**When adding/changing a template, update both `templates/` and
`docs/templates/`** — there is no build step or symlink keeping them in
sync automatically.

## User manual

The end-user manual is written in `docs/exam-bench-manual.md` — edit
that file for any content change, never the generated HTML directly.
`docs/exam-bench-manual.html` (served alongside the app by GitHub
Pages) is a **generated file**: rebuild it with
`scripts/render-manual.sh`, which runs `pandoc` against
`scripts/manual-template.html` — content and presentation are
deliberately separate: the template never contains manual text, and
the markdown never contains HTML/CSS/Tailwind classes. The template
styles itself with **Tailwind loaded from the CDN**
(`cdn.tailwindcss.com?plugins=typography`, `darkMode: 'class'`,
`tailwind.config` extends colors/fonts to match `docs/index.html`'s
own palette) — no build step, utility classes are compiled in the
browser at runtime. Pandoc's raw output (`$body$`) is unstyled
semantic HTML with no classes of its own, so it's wrapped in a
`prose`/`prose-invert` container (the `@tailwindcss/typography`
plugin) rather than hand-styled per element. The theme toggle reuses
`docs/index.html`'s exact `exam-bench-theme` localStorage key and
pre-paint script, so a preference set on one page carries over to the
other. The AI-prompt code block in the markdown is fenced as
` ```{.prompt} ` specifically so the template's JS can find it
(`pre.prompt`) and attach a "Copy" button — that's the only code block
tagged this way, on purpose, since it's the only one meant to be
copy-pasted wholesale.

**Gotcha (already hit once, don't reintroduce it):** don't style code
via the typography plugin's `prose-code:` modifier on the `<article>`
wrapper. `prose-code:` targets *every* `code` element, including the
one nested inside `<pre>` — since that nested `<code>` is `inline` and
wraps across many visual lines, any `prose-code:` background/border
renders as a border *around each line* rather than around the block,
and Tailwind Typography's default `--tw-prose-pre-code` text color
(designed for its own default dark `pre` background) can end up
low-contrast if the `pre` background is overridden without also
overriding that variable. Fix, if this needs touching again: leave
`pre`/inline-`code` **background, border, and color** entirely to
typography's own defaults (they already correctly distinguish inline
code from code-in-`pre`) — only use `prose-code:`/`prose-pre:` for
things that can't leak visually, like `font-mono`. Verified with
`chromium-browser --headless --screenshot` (available in this
environment) rather than guessing from markup — worth doing again for
any future template/CSS change here, since there's no other way to
actually see the rendered result in this setup.

After editing the markdown, run the script and commit both the `.md`
and the regenerated `.html` together. An older
`docs/exam-bench-manual.odt` also exists from before the markdown
rewrite; it's not kept in sync and can be regenerated from the
markdown via `pandoc` if still needed, or removed.

## Conventions / notes for future changes
- `docs/index.html` is a single self-contained HTML document — keep new
  code in that file, in the same IIFE-module style, rather than
  splitting into separate JS/CSS files (no build step exists to
  recombine them).
- Exam Bench's CSS is compiled Tailwind output, hand-pasted into
  `<style>` — it's **purged**: only utility classes that were actually
  used in the source Tailwind was built from got compiled into the
  stylesheet. When adding new markup, only use class names that already
  appear elsewhere in the file (check with `grep -o '\.classname{'`) —
  a plausible-looking Tailwind class like `w-fit`, `mt-2`, or
  `cursor-pointer` may silently do nothing if it wasn't in the original
  build. Reuse existing classes/components (`.mini-btn`, `.toggle-row`,
  the FILES-row layout, etc.) rather than introducing new ones.
- The AMC-TXT source text is always the source of truth in Exam Bench;
  avoid introducing parallel state that can drift from it (see
  `ScoreOps` design choice above).
- `MAX_CHOICES = 5` in `AMCParser` reflects ZipGrade's standard bubble
  form (A–E) — a hard external constraint, not arbitrary.
- `Templates`' single-slot selected-bytes cache and no-prefetch-the-list
  behavior are deliberate memory constraints, not oversights — don't
  "helpfully" prefetch all templates or cache every template ever
  touched. This applies only to *default* (GitHub-fetched) templates —
  it's intentionally the opposite for `customTemplates`: a user-uploaded
  template is explicit data the user handed over, so it's kept (and
  persisted) until they explicitly remove it, not evicted on selection
  change like the default-bytes cache.
- Don't wire ODT filling back onto settings-change listeners
  (`in-count`/`in-seed`/`in-shuffle-*`) or template selection — that was
  tried and explicitly reverted because it made every shuffle/seed
  tweak pay for a template fetch + `odf-kit` load + fill. Those changes
  must stay limited to the cheap `resetOutputDocs()` path; only
  `generateOutputDocs()`/`downloadAll()` may call `fillTemplate()`.
- There is no "Generate" button and no header "Export" button anymore
  — both were removed as redundant/relocated. Don't re-add a manual
  "Generate" trigger (versions already regenerate on every settings
  `change`); if a top-level export entry point is wanted again, put it
  in the Versions modal next to FILES, not back in the header.
