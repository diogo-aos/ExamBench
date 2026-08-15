#!/usr/bin/env bash
# Builds test-manage (Elm + Tailwind) and publishes the static output to
# docs/test-manage/, so GitHub Pages serves it alongside the rest of the
# site (at <pages-root>/test-manage/).
#
# test-manage/ is the source of truth (src/*.elm, src/input.css, js/db.js,
# index.html); docs/test-manage/ is a generated deploy copy — same pattern
# already used for docs/templates/ (see dev-docs/ARCHITECTURE.md,
# "Templates"). Rebuild and commit it with this script, don't hand-edit
# anything under docs/test-manage/ directly.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$APP_DIR/.." && pwd)"
OUT_DIR="$ROOT_DIR/docs/test-manage"

"$SCRIPT_DIR/check.sh"

echo "== publishing to $OUT_DIR =="
mkdir -p "$OUT_DIR/js"
cp "$APP_DIR/index.html" "$OUT_DIR/index.html"
cp "$APP_DIR/elm.js" "$OUT_DIR/elm.js"
cp "$APP_DIR/app.css" "$OUT_DIR/app.css"
cp "$APP_DIR/js/db.js" "$OUT_DIR/js/db.js"

echo "wrote $OUT_DIR/{index.html,elm.js,app.css,js/db.js}"
