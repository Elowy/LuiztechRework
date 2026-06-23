#!/usr/bin/env bash
# PostToolUse hook: syntax-check edited JS/PHP files.
# Reads the tool-call JSON on stdin; exit code 2 blocks the action and feeds
# the message on stderr back to Claude so it can fix the error immediately.
f=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$f" ] && exit 0
[ -f "$f" ] || exit 0

case "$f" in
  *.js)
    if ! out=$(node --check "$f" 2>&1); then
      { echo "❌ JS syntax error in $f:"; echo "$out"; } >&2
      exit 2
    fi
    ;;
  *.php)
    if ! out=$(php -l "$f" 2>&1); then
      { echo "❌ PHP syntax error in $f:"; echo "$out"; } >&2
      exit 2
    fi
    ;;
esac
exit 0
