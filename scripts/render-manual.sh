#!/usr/bin/env bash
# Renders docs/exam-bench-manual.md into a styled, standalone
# docs/exam-bench-manual.html using scripts/manual-template.html.
# Content lives only in the markdown; this script and the template
# never need to change just because the manual's text changes.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SRC="$ROOT_DIR/docs/exam-bench-manual.md"
TEMPLATE="$SCRIPT_DIR/manual-template.html"
OUT="$ROOT_DIR/docs/exam-bench-manual.html"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "error: pandoc is required but not installed (https://pandoc.org/installing.html)" >&2
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "error: source manual not found at $SRC" >&2
  exit 1
fi

pandoc "$SRC" \
  --template="$TEMPLATE" \
  --standalone \
  --toc \
  --toc-depth=2 \
  --metadata title="Exam Bench — User Manual" \
  --metadata author="CAP Diogo Silva" \
  --metadata lang=en \
  -o "$OUT"

echo "wrote $OUT"
