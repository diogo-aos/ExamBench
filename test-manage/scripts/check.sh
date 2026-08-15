#!/usr/bin/env bash
# Compiles test-manage (Elm + Tailwind) and, if an elm-test suite exists,
# runs it. There is no test suite yet (see GitHub issue #5 — "test-manage:
# add elm-test / elm-program-test coverage"); this script is written to
# pick one up automatically the day that issue is done, rather than assume
# there's nothing to run and need editing later. Until then it just
# compiles and reports that no tests were found.
#
# Run before deploy-to-docs.sh, or in CI, as a "does this still build (and
# pass its tests, once it has any)" gate.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$APP_DIR"

if [ ! -d node_modules ]; then
  echo "== installing dependencies =="
  npm install
fi

echo "== compiling Elm (src/Main.elm) =="
npx elm make src/Main.elm --output=/dev/null

echo "== compiling Tailwind CSS =="
npm run build:css

if [ -d tests ] && npx --no-install elm-test --version >/dev/null 2>&1; then
  echo "== running elm-test =="
  npx elm-test
else
  echo "== no elm-test suite found (tests/ directory) — skipping =="
  echo "   (see GitHub issue #5 to add one; this script will pick it up"
  echo "   automatically once tests/ exists)"
fi

echo "OK"
