## Context
The ledger refuses a verdict recorded without a head sha, but the refusal reason is not asserted anywhere.

## Current state (verified 2026-10-13)
`src/ledger/ledger.ts:88` returns `missing-head`; no test names it (`grep -rn "missing-head" src/**/*.test.ts` finds nothing).

## What to build
1. Add a test in `src/ledger/ledger.test.ts` that records without `--head` and asserts the reason string `missing-head` exactly.

## Explicitly out of scope
Changing the refusal itself.

## Acceptance criteria
- [ ] the new test fails on a build that drops the refusal, and passes on main.

## Verification
`bun test src/ledger/ledger.test.ts` prints `0 fail`.

## References
dev-loop-machine #2.

Blocked by: #12

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
