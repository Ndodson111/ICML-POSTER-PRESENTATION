#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Serving ICML presentation from: $ROOT"
echo "Open: http://127.0.0.1:${PORT}/"
exec python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "$ROOT"
