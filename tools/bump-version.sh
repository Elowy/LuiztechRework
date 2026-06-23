#!/usr/bin/env bash
# Bump the cache-busting ?v=NN query string on every CSS/JS reference across
# all *.html pages, keeping them in sync. Run this after editing any asset.
#
# Usage:
#   bash tools/bump-version.sh        # auto-increment to (current max + 1)
#   bash tools/bump-version.sh 60     # set an explicit version
set -euo pipefail
cd "$(dirname "$0")/.."

cur=$(grep -rho '?v=[0-9]\+' ./*.html | grep -o '[0-9]\+' | sort -n | tail -1 || true)
[ -z "${cur:-}" ] && cur=0
new=${1:-$((cur + 1))}

for f in ./*.html; do
  sed -i "s/?v=[0-9]\+/?v=$new/g" "$f"
done

echo "Cache-bust version: $cur -> $new"
distinct=$(grep -rho '?v=[0-9]\+' ./*.html | sort -u | tr '\n' ' ')
echo "Versions now present: $distinct"
[ "$(grep -rho '?v=[0-9]\+' ./*.html | sort -u | wc -l)" -eq 1 ] \
  && echo "✓ all references in sync" \
  || echo "⚠ references are NOT in sync — check manually"
