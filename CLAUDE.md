# plan-breakdown — frontier planning → executor-grade work breakdown

Arc skill bundle. One skill (`skill/SKILL.md`, the `/plan-breakdown` command), no state. `scripts/` holds a repo-side check, not installed with the skill. The canonical procedure lives in compass `sops/plan-breakdown.md` — **when the SOP and this skill disagree, the SOP wins**; change the SOP first, then mirror here.

## Working in this repo

- The skill is procedure-only: edits are prose edits. Hold them to the same bar the skill preaches — every instruction executable by a mid-tier model with zero context.
- Version source of truth: `arc-manifest.yaml`. Bump per compass `sops/versioning.md` (patch for wording, minor for procedure changes, major for phase-structure changes).
- The machine-block example in `skill/SKILL.md` must parse with dev-loop-machine's parser: run `bash scripts/check-machine-block.sh` before pushing (it exits non-zero when it does not). Keep exactly one ```` ```yaml dlm ```` block in SKILL.md.
- Keep `skill/SKILL.md` self-contained: it must work for consumers with no compass checkout (the SOP link degrades gracefully).
- The installed projection is a symlink from `~/.claude/skills/plan-breakdown` → this repo's `skill/` (or the arc pkg copy). Edit here, never in the projection.

## Provenance

Codified 2026-07-02 from cortex epic #1346 (federation-lifecycle review → 24 executor-grade sub-issues → Opus waves). See README §Provenance.
