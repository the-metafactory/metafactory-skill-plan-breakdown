#!/usr/bin/env bash
# check-machine-block.sh — run dlm's own parser over the skill's machine-block
# example and test/fixtures/, at the dev-loop-machine commit in scripts/dlm-pin.
#
#   bash scripts/check-machine-block.sh            # fetch the pinned dlm into a cache, then check
#   DLM_DIR=/path/to/dlm bash scripts/check-machine-block.sh   # use a checkout you already have
#
# Bumping the pin: put the new dev-loop-machine main sha in scripts/dlm-pin,
# run this script, fix the skill example or the fixtures until it exits 0, and
# name the new sha in CHANGELOG.md. The pin moves only on purpose: a dlm change
# to the block schema should turn this red, not slip past it.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
pin="$(tr -d '[:space:]' < "$here/dlm-pin")"
if [[ ! "$pin" =~ ^[0-9a-f]{40}$ ]]; then echo "scripts/dlm-pin is not a 40-hex sha: $pin" >&2; exit 64; fi
# Never inherit a caller's git plumbing (a leaked GIT_DIR points every git call below at the wrong repo).
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_COMMON_DIR
if [ -z "${DLM_DIR:-}" ]; then
  cache="${DLM_CACHE:-${TMPDIR:-/tmp}/plan-breakdown-dlm}"
  DLM_DIR="$cache/$pin"
  if [ ! -f "$DLM_DIR/src/tracker/block.ts" ]; then
    rm -rf "$DLM_DIR.partial"
    git init -q "$DLM_DIR.partial"
    git -C "$DLM_DIR.partial" fetch -q --depth 1 "${DLM_REMOTE:-https://github.com/the-metafactory/dev-loop-machine.git}" "$pin"
    git -C "$DLM_DIR.partial" -c advice.detachedHead=false checkout -q FETCH_HEAD
    mkdir -p "$cache"
    mv "$DLM_DIR.partial" "$DLM_DIR"
  fi
fi
actual="$(git -C "$DLM_DIR" rev-parse HEAD)"
if [ "$actual" != "$pin" ]; then echo "DLM_DIR $DLM_DIR is at $actual, not the pinned $pin" >&2; exit 1; fi
DLM_DIR="$DLM_DIR" exec bun "$here/check-machine-block.ts"
