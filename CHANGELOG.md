# Changelog

Versions follow compass `sops/versioning.md`; the version source of truth is `arc-manifest.yaml`.

## 0.3.0 — unreleased

Written for [dev-loop-machine#11](https://github.com/the-metafactory/dev-loop-machine/issues/11), against dev-loop-machine `main` at `09b1da43c295e3fa7e61bc1117c0b0d610549eef`.

- **Machine block.** Step 2: every sub-issue carries one fenced `yaml dlm` block after its seven prose sections — dlm's machine-block schema with one example per field, the rules its parser and brief checker enforce, and the `units.tsv` note each kind of bad block produces. A sub-issue without the block is not executor-grade.
- **Waves dlm can read.** Step 3: the wave table stays a comment on the epic for humans; dependencies are also written where dlm reads them (GitHub issue dependencies or a `Blocked by: #n` line on each sub-issue), and the task list is derived with `dlm sync <epic>` instead of hand-mirrored.
- **Briefs from dlm.** Step 4 quotes dlm's usage text verbatim and says what `dlm sync`, `dlm next`, `dlm drive` and `dlm release` do; implementer briefs are the files `dlm drive` writes, and holds go in each block's `holds:`. Step 5 starts with `dlm closeout <epic>`.
- **Check.** `scripts/check-machine-block.sh` runs dlm's own tracker adapter and `derive()` (pinned in `scripts/dlm-pin`) over the skill's example and `test/fixtures/`; the bad fixtures must be refused.
- **Manifest.** `repository:` names `the-metafactory/plan-breakdown` (it named `metafactory-skill-plan-breakdown`).

## 0.2.0

- Canonical home of the skill: name `plan-breakdown`, full compass-core `sops/` paths.

## 0.1.0

- First release: the five-step procedure.
