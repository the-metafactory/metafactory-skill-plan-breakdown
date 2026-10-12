// check-machine-block.ts — does the skill's machine-block example still read
// the way dev-loop-machine reads it?
//
// Runs dlm's OWN code, at the commit pinned in scripts/dlm-pin, over:
//   - the ```yaml dlm block in skill/SKILL.md (the example consumers copy), and
//   - the sub-issue bodies in test/fixtures/,
// through the same path `dlm sync <epic>` takes: the GitHub adapter
// (src/tracker/github.ts, fed by a fake `gh`), then derive() (src/drive/sync.ts)
// against the package's loop machine. Each body must land in the unit state
// and note named in EXPECT below; the bad fixtures must be refused, so a parser
// that stopped refusing turns this red too.
//
// Usage: DLM_DIR=<dlm checkout at the pinned sha> bun scripts/check-machine-block.ts
// (scripts/check-machine-block.sh fetches that checkout). Exit 0 all match,
// 1 any mismatch, 64 usage.

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const dlm = process.env.DLM_DIR;
if (!dlm) {
  console.error("check-machine-block: set DLM_DIR to a dev-loop-machine checkout (scripts/check-machine-block.sh does)");
  process.exit(64);
}

const { githubTracker } = await import(join(dlm, "src/tracker/github.ts"));
const { readBlockFromMarkdown } = await import(join(dlm, "src/tracker/block.ts"));
const { gather, derive } = await import(join(dlm, "src/drive/sync.ts"));
const { loadMachine } = await import(join(dlm, "src/machine/load.ts"));

const skill = readFileSync(join(root, "skill/SKILL.md"), "utf8");
const fixture = (name: string): string => readFileSync(join(root, "test/fixtures", name), "utf8");

// The epic (#100) and its sub-issues, in sub-issue order. #12 and #13 are
// closed blockers outside the epic (the skill's own "Blocked by: #12, #13"
// example names both), so a valid block that names them is `ready`.
const EPIC = "100";
const BLOCKERS = ["12", "13"];
const bodies: Record<string, { title: string; body: string }> = {
  "101": { title: "skill/SKILL.md example", body: skill },
  "102": { title: "fixture sub-issue.md", body: fixture("sub-issue.md") },
  "103": { title: "fixture no-block.md", body: fixture("no-block.md") },
  "104": { title: "fixture bad-block.md", body: fixture("bad-block.md") },
  "105": { title: "fixture unquoted-sha.md", body: fixture("unquoted-sha.md") },
};
const EXPECT: Record<string, { state: string; note: RegExp; blockedBy?: string[] }> = {
  "101": { state: "ready", note: /^$/, blockedBy: BLOCKERS },
  "102": { state: "ready", note: /^$/, blockedBy: ["12"] },
  "103": { state: "brief-not-ready", note: /^no machine block$/ },
  "104": { state: "brief-not-ready", note: /^block-invalid: \/acceptance\/0\/falsifier is required$/ },
  "105": { state: "brief-not-ready", note: /^block-invalid: \/baseSha must be string$/ },
};

// A fake `gh`: answers the four `gh api` paths the GitHub adapter reads.
const repo = "example/repo";
const ghFake = (_cmd: string, args: string[]) => {
  const path = args[args.length - 1]!.replace(/\?.*$/, "");
  const m = new RegExp(`^repos/${repo}/issues/(\\d+)(/sub_issues|/dependencies/blocked_by)?$`).exec(path);
  const json = (v: unknown) => ({ code: 0, stdout: JSON.stringify(v), stderr: "" });
  if (m === null) return { code: 1, stdout: "", stderr: `unexpected gh call: ${args.join(" ")}` };
  const [, n, sub] = m;
  if (sub === "/sub_issues") return json(n === EPIC ? Object.keys(bodies).map((k) => ({ number: Number(k) })) : []);
  if (sub === "/dependencies/blocked_by") return json([]);
  if (n === EPIC) return json({ title: "epic", body: "", state: "open", sub_issues_summary: { total: Object.keys(bodies).length } });
  if (BLOCKERS.includes(n!)) return json({ title: "blocker", body: "", state: "closed", sub_issues_summary: { total: 0 } });
  const b = bodies[n!];
  if (b === undefined) return { code: 1, stdout: "", stderr: `no issue ${n}` };
  return json({ ...b, state: "open", sub_issues_summary: { total: 0 }, issue_dependencies_summary: { total_blocked_by: 0 } });
};

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.log(`FAIL ${msg}`);
};

// The skill must carry exactly one machine block, and it must be a block.
const own = readBlockFromMarkdown(skill);
if (!own.ok) fail(`skill/SKILL.md: ${own.reason}: ${own.detail}`);
else if (own.block === undefined) fail("skill/SKILL.md carries no ```yaml dlm block");

const machine = loadMachine(join(dlm, "machines/loop.yaml"));
if (!machine.ok) {
  console.error(`check-machine-block: dlm's loop machine refused: ${machine.reason}: ${machine.detail}`);
  process.exit(1);
}
const g = gather(EPIC, githubTracker({ repo }, ghFake));
if (!g.ok) {
  console.error(`check-machine-block: gather refused: ${g.reason}: ${g.detail}`);
  process.exit(1);
}
const units = derive(g.gathering, machine.machine, { state_version: 1, machine: machine.machine.machine, nodes: {} });
for (const u of units) {
  const want = EXPECT[u.id]!;
  const label = `${u.id} (${bodies[u.id]!.title})`;
  if (u.state !== want.state || !want.note.test(u.note)) fail(`${label}: got ${u.state} "${u.note}", want ${want.state} ${want.note}`);
  else if (want.blockedBy && u.blockedBy.join(",") !== want.blockedBy.join(",")) fail(`${label}: blocked_by ${u.blockedBy.join(",") || "-"}, want ${want.blockedBy.join(",")}`);
  else console.log(`ok   ${label}: ${u.state}${u.note ? ` (${u.note})` : ""}`);
}
if (units.length !== Object.keys(EXPECT).length) fail(`derived ${units.length} units, want ${Object.keys(EXPECT).length}`);

console.log(`${units.length} units checked against dlm ${readFileSync(join(root, "scripts/dlm-pin"), "utf8").trim()}: ${failures === 0 ? "all match" : `${failures} mismatch`}`);
process.exit(failures === 0 ? 0 : 1);
