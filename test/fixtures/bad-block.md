## Context
A sub-issue whose acceptance line has a predicate and no falsifier: the tracker refuses the block.

```yaml dlm
goal: "Assert the ledger's missing-head refusal by its exact reason string"
scope:
  owns: ["src/ledger/ledger.test.ts"]
  mustNotTouch: ["src/ledger/ledger.ts"]
baseSha: "09b1da43c295e3fa7e61bc1117c0b0d610549eef"
acceptance:
  - predicate: "bun test src/ledger/ledger.test.ts -t missing-head"
verify:
  - command: "bun test src/ledger/ledger.test.ts"
    quote: "0 fail"
timebox: "45m"
forbidden: []
report: ["branch and head sha"]
standing: "Red first."
holds: []
```
