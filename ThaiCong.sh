#!/bin/sh
cd "$(dirname "$0")" || exit 1
PAGE="$(pwd)/index.html"
URL="file://${PAGE}"
for bin in microsoft-edge microsoft-edge-stable google-chrome google-chrome-stable chromium chromium-browser; do
  if command -v "$bin" >/dev/null 2>&1; then
    exec "$bin" --app="$URL" --window-size=1100,780 --disable-extensions --no-first-run
  fi
done
if command -v xdg-open >/dev/null 2>&1; then
  exec xdg-open "$PAGE"
fi
echo "Khong tim thay trinh duyet. Hay mo index.html." >&2
exit 1
