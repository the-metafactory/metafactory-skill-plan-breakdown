# plan-breakdown

Break a detailed plan, review, or stocktake into an **epic + executor-grade sub-issues a less capable model can implement with high quality** — then run the auto-dev loop over them and close with an implementation-vs-findings review.

The one idea: **spend the planner's intelligence making the work executable without it.** A frontier-tier session does the verified deep review and writes the breakdown; a cheaper executor tier implements it. The quality bar for every issue: *a mid-tier model with zero session context and no ability to ask questions implements this correctly.*

## What ships here

- **`skill/SKILL.md`** — the `/plan-breakdown` skill: a five-phase operational procedure
  1. **Deep review** — fan-out reviewers + adversarial refutation of every gap claim, pinned to `origin/main`
  2. **Work breakdown** — epic (demonstrable Definition-of-Done, stocktake matrix, working-notes-for-executors) + sub-issues held to the executor-grade bar
  3. **Wave task list** — partitioned by file-overlap, trust-path serialization, dependency order
  4. **Execute** — hand-off to the consumer's dev-loop SOPs (unattended or in-session)
  5. **Close-out** — fresh-context implementation-vs-findings review back to the principal

## Canonical procedure

The binding SOP lives in compass-core: [`sops/plan-breakdown.md`](https://github.com/the-metafactory/compass-core/blob/main/sops/plan-breakdown.md). It composes with [`sops/autonomous-work.md`](https://github.com/the-metafactory/compass-core/blob/main/sops/autonomous-work.md) and [`sops/in-session-dev-loop.md`](https://github.com/the-metafactory/compass-core/blob/main/sops/in-session-dev-loop.md) for the execution loop. The skill is self-contained enough to run without a compass-core checkout, but when the SOP and the skill disagree, the SOP wins.

## Install

Via arc (metafactory hosts):

```bash
arc install plan-breakdown
```

Manual (any Claude Code setup): symlink or copy `skill/` to `~/.claude/skills/plan-breakdown/`.

## Provenance

Codified 2026-07-02 from the workflow proven end-to-end on [cortex epic #1346](https://github.com/the-metafactory/cortex/issues/1346): a federation-lifecycle review (5 PR reviews, 7 subsystem stocktakes, adversarial verification pass) broken into 24 sub-issues and executed by Opus-tier agents in waves.
