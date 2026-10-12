---
name: plan-breakdown
description: Break a detailed plan, review, or stocktake into an epic + executor-grade sub-issues a less capable model can implement with high quality, then run the auto-dev loop over them and close with an implementation-vs-findings review. USE WHEN break down this plan, plan breakdown, work breakdown, turn findings into issues, epic and sub-issues, make this executable by a smaller model, frontier to executor handoff, hand this to the dev loop, break down for Opus.
---

# /plan-breakdown — frontier planning → executor-grade work

Canonical procedure: **compass-core `sops/plan-breakdown.md`** ([github.com/the-metafactory/compass-core/blob/main/sops/plan-breakdown.md](https://github.com/the-metafactory/compass-core/blob/main/sops/plan-breakdown.md)) — read it when a checkout is available; it is binding and this skill is its operational front-end. The execution loop it feeds: compass-core `sops/autonomous-work.md` (unattended) / `sops/in-session-dev-loop.md` (attended). Without a compass-core checkout, the procedure below is self-contained.

> **One line.** Spend the planner's intelligence making the work executable *without* it: every issue must stand alone — verified evidence, exact steps, binary acceptance, copy-pasteable verification — so the executor never has to be smart, only careful.

## Step 0 — scope + pre-flight

Establish from the principal's ask: what is being broken down, which repo(s), which executor model tier, and what is HELD (infra standups, prod deploys, live config edits, security-posture flips). Output:

```
SOP: plan-breakdown | Scope: … | Executor: … | Findings: … | Output: epic + N sub-issues, K waves | Holds: …
```

## Step 1 — verified findings (skip only if the principal hands you already-verified findings)

- Fan out parallel reviewers per artifact class (per-PR, per-doc, per-subsystem stocktake). Structured returns: works / partial / missing / manual-steps / open-issues, each claim with `file:line` evidence and the exact commands run.
- **Adversarially verify EVERY missing/partial claim**: refutation-prompted agents; case-insensitive + snake/camel/kebab/Pascal variant searches; check merged PRs and open issues that may already cover it; check whether the capability exists under a different verb name. Grep is case- and separator-blind — unverified absence claims are the #1 source of duplicate work.
- Pin to `origin/main` / PR head refs (`git fetch origin pull/{N}/head` recovers closed-branch content), never the local tree. Mask all PII. Distinguish "merged" from "deployed/live". Kill or correct refuted claims BEFORE writing issues.

## Step 2 — epic + sub-issues (the executor-grade bar)

- **Epic body**: Why / **Definition of Done as a demonstrable walkthrough** (observable end state a human can run, each step naming the verb/issue that makes it true) / stocktake table (✅ works · ⚠️ partial · ❌ missing · ⏸ held, each with issue numbers) / phases / working-notes-for-executors (traps, footguns, ordering constraints) / provenance.
- **New issues ONLY for untracked work**; existing issues attach as sub-issues (`gh sub-issue add <epic> <n>`; sub-issues are single-parent — an issue already under another umbrella stays there and is cross-referenced in the epic body instead). Cross-repo attach: `gh api -X POST repos/{o}/{r}/issues/{epic}/sub_issues -F sub_issue_id=<global-id>` (the global id, not the number).
- **Every new issue body**: Context / Current state (verified date, `file:line` evidence incl. negative-space searches) / What to build (numbered steps, exact files, pattern-to-copy pointers, stop-and-ask decisions with named owner) / Explicitly out of scope / Acceptance criteria (binary checkboxes) / Verification (copy-pasteable commands + expected results) / References — **then the machine block** (below).
- **The bar, as a test**: *could a mid-tier model with zero session context and no ability to ask questions implement this correctly?* Numbers and thresholds verbatim (never "reasonable"/"properly"); commands runnable as pasted; prohibitions explicit ("never print the key"), not implied.
- **Bookkeeping now, not later**: labels per repo standard (type + priority); stale issues found during review get a verify-and-close comment; work auto-closed by force-pushes/history rewrites that was NOT rejected gets a re-land comment crediting the original author.

### The machine block — a sub-issue without one is not executor-grade

After the seven prose sections, every sub-issue carries exactly one fenced `yaml dlm` block. It is what dev-loop-machine (`dlm`) reads: `dlm drive` renders the implementer's brief from it, and `dlm closeout` re-runs its acceptance predicates. The prose is for the human reader; the block is the contract. The schema is dev-loop-machine's `schema/machine-block.schema.json` (parser: `src/tracker/block.ts`); this skill is checked against it at a pinned commit (`scripts/check-machine-block.sh`).

```yaml dlm
goal: "Assert the ledger's missing-head refusal by its exact reason string"
scope:
  owns:
    - "src/ledger/ledger.test.ts"
  mustNotTouch:
    - "src/ledger/ledger.ts"
    - "machines/"
baseSha: "09b1da43c295e3fa7e61bc1117c0b0d610549eef"
acceptance:
  - predicate: "bun test src/ledger/ledger.test.ts -t missing-head"
    falsifier: "delete the missing-head branch in src/ledger/ledger.ts; the same command exits non-zero"
verify:
  - command: "bun test src/ledger/ledger.test.ts"
    quote: "0 fail"
timebox: "45m"
forbidden:
  - "editing src/ledger/ledger.ts"
report:
  - "branch and head sha"
  - "the N pass / M fail line, pasted"
standing: |
  Red first: write the failing test, see it fail, then implement.
  Never git add -A; never force-push; stage explicit paths.
holds:
  - "no PR, no merge: push the branch and report"
```

All ten keys are required and no other key is allowed. Every string except `standing` is one non-blank line.

| Key | Holds | Rule the parser or brief checker enforces |
|---|---|---|
| `goal` | one sentence: the outcome | not a placeholder (`todo`, `tbd`, `n/a`, `none`, `...`) |
| `scope.owns` | paths the lane may change | at least one |
| `scope.mustNotTouch` | paths it must not change | at least one |
| `baseSha` | the `origin/main` sha the issue was verified at | 40 lowercase hex, **quoted** — an all-digit sha unquoted reads as a number and the block is refused |
| `acceptance[]` | `predicate:` a shell command that exits 0 when the work is done; `falsifier:` the change that makes it exit non-zero | at least one; both keys; predicate ≠ falsifier; neither a no-op (`true`, `exit 0`, `echo …`). `dlm closeout` runs the predicate at head (must exit 0) and at `baseSha` (must not — else `vacuous`) |
| `verify[]` | `command:` to run, `quote:` the output line that proves it | at least one; both keys; command not a no-op |
| `timebox` | how long before the lane stops and reports | `45m`, `2h` (units `m min mins h hr hrs`) |
| `forbidden` | actions beyond the floor | may be `[]`; the floor (`prod-deploy`, `delete-evidence-or-data`, `force-push`, `message-to-people`) is always added |
| `report` | what the lane hands back | at least one |
| `standing` | the standing instructions, carried verbatim | multi-line allowed (`|`); no line may start with ` ``` ` or `~~~` |
| `holds` | what this lane must NOT do (the epic's holds that apply) | may be `[]` (the brief then says `- none`) |

**What a bad block does.** `dlm sync` does not refuse the epic over it; it marks that unit `brief-not-ready` with the reason in the `note` column of `state/units.tsv`, and `next`/`drive` never claim it. The notes:

| Body | `units.tsv` note |
|---|---|
| no `yaml dlm` block | `no machine block` |
| a key missing, extra or wrong-typed | `block-invalid: /acceptance/0/falsifier is required` (the first problem, as a JSON path) |
| not YAML | `block-unparseable: …` |
| two blocks | `block-duplicate: …` |
| fence never closed | `block-unclosed: …` |
| valid block, but the brief checker refuses it (hollow value, predicate = falsifier) | `brief refused: <code> <FIELD>: <reason>` |

`dlm sync` refuses outright (`tracker-refused`, exit 2) only when the epic, a sub-issue or an outside blocker cannot be read. To write or replace a block without touching the prose, and to see what dlm reads back:

```bash
dlm tracker write-block <id> --from block.yaml   # validates first; replaces only the block
dlm tracker read <id>                             # what sync will see
```

## Step 3 — wave task list

Partition sub-issues into waves by three rules: (1) **file-overlap** — slices touching the same hot file serialize into one lane; (2) **trust-path serialization** — auth/signing/crypto/key-material/boot-gate slices never run concurrently with each other and each gets an adversarial review lane; (3) **dependency order**. If the breakdown includes an E2E guard test, it starts in wave 1 with `test.todo` entries per gated slice — it is the epic's progress meter; each merged fix flips one live.

**Post the wave table as a comment ON the epic** — the human ground truth — and name the HOLDS in it so no executor "helpfully" does them. dlm does not read that comment. It reads two things, so write the waves there too:

- **Membership and order**: the sub-issues attached to the epic (`gh sub-issue add`), in sub-issue order. Sibling order is NOT a dependency; siblings run in parallel.
- **Dependencies**: GitHub's own issue dependencies (blocked-by), or a line in the sub-issue's prose, outside the block:

  ```
  Blocked by: #12, #13
  ```

  Every wave-2 issue names the wave-1 issues it waits on this way. A blocker outside the epic counts as done only when it is closed.

Wave-comment template (post on the epic):

```
## Waves
| Wave | Issues | Blocked by (written on each issue as "Blocked by: #n") | Lane notes |
|---|---|---|---|
| 1 | #11, #12 | — | #11 and #12 touch disjoint files |
| 2 | #13 | #11, #12 | trust path: adversarial review lane |

HOLDS (also in each issue's `holds:`): prod deploys · the release tag · …
Task list: derived by `dlm sync <epic>` into state/units.tsv — do not hand-mirror it.
```

Then derive the task list instead of mirroring it by hand:

```bash
dlm sync <epic>
```

It prints `<state-dir>/units.tsv: N units — ready a, claimed b, blocked c, brief-not-ready d, done e`. Fix every `brief-not-ready` unit's block now (its note says why), and re-sync until each unit is `ready` or `blocked` on the issues you intended. `units.tsv` is derived: never hand-edit it.

## Step 4 — run the loop

Hand the waves to the consumer's dev loop (compass-core `sops/autonomous-work.md` unattended / `sops/in-session-dev-loop.md` attended). Breakdown-specific parameters:

- **Executor model** = the cheaper tier the principal named. The planner session stays orchestrator — dispatch, gate, merge, narrate — and NEVER implements. If a brief needs to teach beyond the issue, fix the issue (its block), never the brief.
- **Implementer briefs come from `dlm drive`, not from prose.** The consumer repo needs a `dlm.yaml` naming its tracker (`tracker:` with `kind: github` and `repo: owner/name`, or `kind: ado` and `org: URL`), or pass `--tracker/--repo/--org`. The commands (dlm's usage text, verbatim; dlm has no `--help`, an unknown flag prints this and exits 64):

  ```
  usage:
    dlm sync <epic>
    dlm next <epic> --session <name> [--remote <r>]
    dlm drive <epic> --session <name> [--standing <file>] [--remote <r>]
    dlm release <unit> [--salvage] [--session <name>] [--remote <r>]
  tracker (sync, next, drive): --tracker github|ado  --repo owner/name  --org URL, else ./dlm.yaml
  common: --state-dir <dir> (DLM_STATE_DIR, default ./state)  --machines-dir <dir> (DLM_MACHINES_DIR)  --machine <id> (default loop)
  units.tsv is DERIVED: every sync, next and drive rewrites it; never hand-edit it.
  ```

  - `dlm sync <epic>` — re-derives `units.tsv` (Step 3).
  - `dlm next <epic> --session <name>` — syncs, releases this session's unit if it is done, and claims the first `ready` unit, recording its branch head (branch `dlm/unit-<id>`). Prints `claimed <id> for <name>: <title>`. One unit per session; a second session cannot claim the same unit. Refuses `no-ready-unit` when nothing is ready.
  - `dlm drive <epic> --session <name> [--standing <file>]` — resumes the held unit or claims one, renders the brief from its block, checks it, and writes it to `<state-dir>/briefs/<unit>.md`. Prints `unit:`, `title:`, `brief:`, `node:`, `allowed:`, `branch:`, `resumed:` lines. Spawn the implementer with **that file** as its brief. A unit whose block does not render refuses `brief-not-ready` / `brief-refused` and logs a `refuse-to-spawn` row in `decisions.tsv`; the session keeps the claim until you fix the block or release it. `--standing <file>` makes drive refuse unless the block's `standing` equals that file exactly.
  - `dlm release <unit> [--salvage]` — gives back a claim the session cannot finish: released when the unit is done or its branch has not moved; a moved branch is refused unless `--salvage`.
  - Exit codes: 0 ok · 2 refused (`refused <reason>: <detail>` on stderr) · 1 the state file is invalid · 64 usage.
- **Holds are written where executors read them**: in each block's `holds:` (rendered into the brief's HOLDS section) and in the epic's wave comment. The floor actions are in every brief's FORBIDDEN without being written.
- **Lane rules the brief does not replace**: worktree from `origin/main` at the block's `baseSha`; verify-before-change; scoped tests + typecheck only (never the full suite in a fresh worktree); push the branch, do NOT merge, do NOT open the PR; structured report-back per the block's `report:`.
- **Review scaling**: every slice through the code-review skill; trust-path lanes additionally get an independent adversarial pass (refute-to-kill, FIX-FIRST on blockers). Gate-green before merge, never through a red gate.
- **Small fleet** (rate limits kill mid-task agents); salvage dead agents' worktrees before redoing (commit WIP as SALVAGED first, then `dlm release <unit> --salvage`).

## Step 5 — implementation-vs-findings close-out

When the queue drains (or at the principal's checkpoint): run `dlm closeout <epic>` — it re-runs every block's acceptance predicates on a fresh clone and prints pass/fail/vacuous per predicate. Then spawn a **fresh-context** reviewer with the epic, the findings, the closeout report and the merged PR list. Per finding: addressed by which PR / partially addressed (what remains) / not addressed (why). Per acceptance criterion: pass with evidence / fail. Deltas become new issues — never silent scope creep. Deliver the report to the principal (it is the deliverable that started the delegation), then run the consumer's retrospective SOP; stale-claim escapes are the highest-value learning.

## Rails

No unverified claim enters an issue · no sub-issue without a machine block · never duplicate a tracked issue · the Definition of Done is an observable walkthrough, not an aspiration · holds are written where executors read · the strongest model writes issues, not fixes.
