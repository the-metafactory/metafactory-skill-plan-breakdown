## Context
A block whose baseSha is all digits and unquoted: YAML reads it as a number, so the block is invalid. Quote every baseSha.

```yaml dlm
goal: "Assert the ledger's missing-head refusal by its exact reason string"
scope:
  owns: ["src/ledger/ledger.test.ts"]
  mustNotTouch: ["src/ledger/ledger.ts"]
baseSha: 1234567890123456789012345678901234567890
acceptance:
  - predicate: "bun test src/ledger/ledger.test.ts -t missing-head"
    falsifier: "delete the refusal; the predicate exits non-zero"
verify:
  - command: "bun test src/ledger/ledger.test.ts"
    quote: "0 fail"
timebox: "45m"
forbidden: []
report: ["branch and head sha"]
standing: "Red first."
holds: []
```
