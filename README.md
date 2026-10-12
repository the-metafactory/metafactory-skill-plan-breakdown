# plan-breakdown

Break a detailed plan, review, or stocktake into an **epic + executor-grade sub-issues a less capable model can implement with high quality** — then run the auto-dev loop over them and close with an implementation-vs-findings review.

The one idea: **spend the planner's intelligence making the work executable without it.** A frontier-tier session does the verified deep review and writes the breakdown; a cheaper executor tier implements it. The quality bar for every issue: *a mid-tier model with zero session context and no ability to ask questions implements this correctly.*

## What ships here

- **`skill/SKILL.md`** — the `/plan-breakdown` skill: a five-phase operational procedure
  1. **Deep review** — fan-out reviewers + adversarial refutation of every gap claim, pinned to `origin/main`
  2. **Work breakdown** — epic (demonstrable Definition-of-Done, stocktake matrix, working-notes-for-executors) + sub-issues held to the executor-grade bar
  3. **Wave task list** — partitioned by file-overlap, trust-path serialization, dependency order; derived with `dlm sync <epic>`
  4. **Execute** — briefs from `dlm drive`, handed to the consumer's dev-loop SOPs (unattended or in-session)
  5. **Close-out** — `dlm closeout`, then a fresh-context implementation-vs-findings review back to the principal

Every sub-issue carries a fenced `yaml dlm` **machine block** — the contract [dev-loop-machine](https://github.com/the-metafactory/dev-loop-machine) reads to derive the task list, render implementer briefs and re-run acceptance predicates.

## Checking the skill against dlm

`skill/SKILL.md`'s machine-block example and `test/fixtures/` are run through dev-loop-machine's own tracker adapter and sync derivation, at the commit pinned in `scripts/dlm-pin`:

```bash
bash scripts/check-machine-block.sh        # needs bun, git, and read access to dev-loop-machine
```

It exits 0 when the example derives a `ready` unit and every bad fixture is refused with its expected note. To move to a newer dlm: put its sha in `scripts/dlm-pin`, run the script, fix the example or fixtures until it exits 0, and name the sha in `CHANGELOG.md`.

## Canonical skill

This repo is the **canonical home of the `plan-breakdown` skill**. compass-core and other bundles declare it as an arc dependency instead of shipping a copy, so there's one skill to maintain and every install gets the same version.

## Canonical procedure

The binding SOP lives in compass-core: [`sops/plan-breakdown.md`](https://github.com/the-metafactory/compass-core/blob/main/sops/plan-breakdown.md). It composes with [`sops/autonomous-work.md`](https://github.com/the-metafactory/compass-core/blob/main/sops/autonomous-work.md) and [`sops/in-session-dev-loop.md`](https://github.com/the-metafactory/compass-core/blob/main/sops/in-session-dev-loop.md) for the execution loop. The skill is self-contained enough to run without a compass-core checkout, but when the SOP and the skill disagree, the SOP wins.

## Install

Via arc (metafactory hosts):

```bash
arc install https://github.com/the-metafactory/metafactory-skill-plan-breakdown
```

Blocked while compass-core 0.6.x ships its own copy at the same install path (arc refuses a second writer); compass-core 0.7.0 drops it.

Manual (any Claude Code setup): symlink or copy `skill/` to `~/.claude/skills/plan-breakdown/`.

## Provenance

Codified 2026-07-02 from the workflow proven end-to-end on [cortex epic #1346](https://github.com/the-metafactory/cortex/issues/1346): a federation-lifecycle review (5 PR reviews, 7 subsystem stocktakes, adversarial verification pass) broken into 24 sub-issues and executed by Opus-tier agents in waves.
