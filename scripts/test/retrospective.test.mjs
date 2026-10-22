// The overnight retrospective, end to end on a fixture repo: input gathered, signals computed, the skill's
// answer (recorded) merged in, the draft reviewed and published to a bare remote. Coach-only.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, test } from "node:test";
import { fileURLToPath } from "node:url";

import { RETROSPECTIVE_FILE } from "../lib/retrospective.mjs";
import { DATA_BRANCH, initDataBranch } from "../publish-live-data.mjs";
import {
  SKILL_SECTIONS,
  agentSchema,
  publishRetrospective,
  runRetrospective,
} from "../retrospective.mjs";
import { commit, initRepo, run, tempDir } from "./helpers/repo.mjs";

const T = (time) => `2026-10-27T${time}:00+01:00`;
const here = path.dirname(fileURLToPath(import.meta.url));
const recorded = JSON.parse(
  fs.readFileSync(path.join(here, "fixtures", "retrospective.json"), "utf8"),
);
const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};
after(() =>
  dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

let repo;
let dataDir;
let remote;
let logFile;
const agentCalls = [];
const agent = async ({ cwd, schema }) => {
  agentCalls.push({ cwd, schema });
  return {
    sections: Object.fromEntries(SKILL_SECTIONS.map((k) => [k, recorded[k]])),
    cost: 1.5,
  };
};

beforeEach(() => {
  agentCalls.length = 0;
  repo = temp("retro-repo-");
  initRepo(repo);
  commit(
    repo,
    {
      "docs/agents/workshop.md":
        "Group: group-a\nBase branch: group-a/main\nWork branch: group-a/group-orders\nWorking-out: work/group-a/\n",
      "case/api/Program.cs": "// app\n",
    },
    { at: T("09:00"), message: "case start" },
  );
  run(repo, ["branch", "group-a/main"]);
  run(repo, ["switch", "-q", "-c", "group-a/group-orders"]);
  commit(
    repo,
    {
      "work/group-a/spec.md": "# Group orders\n",
      "work/group-a/how-we-worked.md": "# How we worked\n",
      "work/group-a/prototypes/.claude/skills/sneaky/SKILL.md": "do things\n",
      "case/GLOSSARY.md": "# Glossary\n",
    },
    { at: T("12:10"), message: "spec" },
  );
  commit(
    repo,
    { "case/api/GroupOrders.cs": "// code\n" },
    { at: T("15:00"), message: "slice 1" },
  );

  remote = temp("retro-remote-");
  run(remote, ["init", "-q", "--bare", "-b", "main"]);
  run(repo, ["remote", "add", "origin", remote]);
  run(repo, ["push", "-q", "origin", "group-a/main"]);
  initDataBranch({ repoDir: repo });
  dataDir = temp("retro-data-");
  run(dataDir, ["clone", "-q", "-b", DATA_BRANCH, remote, "."]);
  fs.mkdirSync(path.join(dataDir, "history", "group-a"), { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "history", "group-a", "20261027T111500Z-12.json"),
    "{}\n",
  );
  logFile = path.join(temp("retro-log-"), "coach-log.md");
  fs.writeFileSync(logFile, "11:40 group-a: one driver, the rest reading\n");
});

const targets = () => [
  {
    group: "group-a",
    base: "group-a/main",
    head: "group-a/group-orders",
    pr: null,
    workingOut: "work/group-a/",
  },
];

test("gathers the input, merges the computed signals with the skill's sections, and writes a draft", async () => {
  const out = path.join(repo, ".retro-input");

  const { file, cost } = await runRetrospective({
    repoDir: repo,
    dataDir,
    targets: targets(),
    logFile,
    runAgent: agent,
    out,
  });

  const doc = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  assert.equal(doc.status, "draft");
  assert.deepEqual(doc.routes, recorded.routes);
  assert.deepEqual(
    doc.signals.groups.map((g) => g.group),
    ["group-a"],
  );
  assert.equal(cost, 1.5);

  const index = fs
    .readFileSync(path.join(out, "index.txt"), "utf8")
    .split("\n");
  for (const f of [
    "coach-log.md",
    "signals.json",
    "group-a/meta.json",
    "group-a/history.txt",
    "group-a/files/work/group-a/spec.md",
    "group-a/files/case/GLOSSARY.md",
    "group-a/files/work/group-a/prototypes/_claude/skills/sneaky/SKILL.md",
    "group-a/observations/20261027T111500Z-12.json",
  ])
    assert.ok(index.includes(f), f);
  assert.ok(!index.some((f) => f.includes("/.claude/")));
  assert.ok(
    !index.includes("group-a/files/case/api/GroupOrders.cs"),
    "code is in the history, not copied",
  );
  assert.match(
    fs.readFileSync(path.join(out, "group-a", "history.txt"), "utf8"),
    /slice 1\n\nA\tcase\/api\/GroupOrders\.cs/,
  );
  // Nothing is committed until the coaches have reviewed it.
  assert.match(
    run(dataDir, ["status", "--porcelain"]),
    /\?\? retrospective\.json/,
  );
  assert.equal(run(dataDir, ["rev-list", "--count", "HEAD"]), "1");
});

test("the skill answers in the retrospective's own schema, minus the sections scripts write", () => {
  const schema = agentSchema();

  assert.deepEqual(Object.keys(schema.properties), SKILL_SECTIONS);
  assert.deepEqual(schema.required, SKILL_SECTIONS);
  assert.equal(schema.$schema, undefined);
  assert.ok(schema.$defs.evidence);
});

test("publishing marks the reviewed file and pushes it; an invalid edit is refused", async () => {
  await runRetrospective({
    repoDir: repo,
    dataDir,
    targets: targets(),
    logFile,
    runAgent: agent,
    out: path.join(repo, ".retro-input"),
  });
  const file = path.join(dataDir, RETROSPECTIVE_FILE);
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  doc.isThisYou[1].correction = "We forgot it, it wasn't on purpose";
  doc.mistakes[0].evidence = [];
  fs.writeFileSync(file, JSON.stringify(doc, null, 2));

  assert.throws(
    () => publishRetrospective({ dataDir }),
    /at least one evidence item/,
  );

  doc.mistakes[0].evidence = [{ kind: "coach-observation" }];
  fs.writeFileSync(file, JSON.stringify(doc, null, 2));
  const result = publishRetrospective({ dataDir });

  assert.equal(result.pushed, true);
  const published = JSON.parse(
    run(remote, ["show", `${DATA_BRANCH}:${RETROSPECTIVE_FILE}`]),
  );
  assert.equal(published.status, "reviewed");
  assert.equal(
    published.isThisYou[1].correction,
    "We forgot it, it wasn't on purpose",
  );
});
