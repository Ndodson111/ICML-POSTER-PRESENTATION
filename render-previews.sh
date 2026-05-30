#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PREVIEW_DIR="$ROOT/previews"
CHROME_BIN="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
WINDOW_SIZE="${WINDOW_SIZE:-1600,900}"

mkdir -p "$PREVIEW_DIR"

if [ ! -x "$CHROME_BIN" ]; then
  echo "Chrome binary not found at: $CHROME_BIN" >&2
  exit 1
fi

if [ "$#" -gt 0 ]; then
  slides=("$@")
else
  mapfile -t slides < <(find "$ROOT" -maxdepth 1 -type f -name '*.html' ! -name 'index.html' | sort)
fi

for slide in "${slides[@]}"; do
  if [[ "$slide" != /* ]]; then
    slide="$ROOT/$slide"
  fi

  if [ ! -f "$slide" ]; then
    echo "Skipping missing slide: $slide" >&2
    continue
  fi

  filename="$(basename "$slide" .html)"
  output="$PREVIEW_DIR/$filename.png"
  url="file://$slide"

  "$CHROME_BIN" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --window-size="$WINDOW_SIZE" \
    --screenshot="$output" \
    "$url" \
    >/dev/null 2>&1

  echo "Rendered $output"
done
