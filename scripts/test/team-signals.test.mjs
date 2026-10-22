import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { recordedGitHub } from "../lib/github.mjs";
import { checkRetrospective } from "../lib/retrospective.mjs";
import { DATA_BRANCH, initDataBranch } from "../publish-live-data.mjs";
import {
  groupSignals,
  inPlan,
  publishSignals,
  statusOf,
  teamSignals,
  titleOf,
  workingMinutes,
} from "../team-signals.mjs";
import { commit, initRepo, run, tempDir } from "./helpers/repo.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, "..", "team-signals.mjs");
const T = (time) => `2026-10-27T${time}:00+01:00`;
const keysFor = (group) =>
  `Group: ${group}\nBase branch: ${group}/main\nWork branch: ${group}/group-orders\nWorking-out: work/${group}/\nEpic: #7\n`;
const ticket = (number, title, status) =>
  `# ${number}: ${title}\n\n**What to build:** ${title}.\n\n**Status:** ${status}\n`;
const SPEC = `# Spec

## Implementation Decisions

- A group orders controller in the API, with a test per acceptance example.
- A group order page in the web app.
- Notes for the kitchen go in \`docs/group-orders.md\`.
`;
const REVIEW = `# Review

## Round 1

### Act on
- No test for joining twice

## Round 2

### Noted
- The page is getting long
`;

const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};
let repo;
const sha = {};

before(() => {
  repo = temp("team-signals-");
  initRepo(repo);
  sha.start = commit(
    repo,
    {
      "docs/agents/workshop.md": keysFor("group-a"),
      "case/api/Program.cs": "// app\n",
      "case/web/src/App.tsx": "export {};\n",
      ".github/workflows/tests.yml": "name: Tests\n",
      ".agents/skills/grilling/SKILL.md":
        "---\nname: grilling\ndescription: Use when grilling.\n---\n",
      "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
    },
    { at: T("09:00"), message: "case start" },
  );
  run(repo, ["branch", "group-a/main"]);

  // Group A: tickets with Status lines that move, two slices shipped, one dropped and one added.
  run(repo, ["switch", "-q", "-c", "group-a/group-orders"]);
  sha.a1 = commit(
    repo,
    { "case/AGENTS.md": "# Forkful\n" },
    { at: T("11:20"), message: "stub AGENTS.md" },
  );
  sha.a2 = commit(
    repo,
    {
      "work/group-a/spec.md": SPEC,
      "work/group-a/how-we-worked.md": "# How we worked\n",
    },
    { at: T("12:10"), message: "spec" },
  );
  sha.a3 = commit(
    repo,
    {
      "work/group-a/issues/01-start-and-join.md": ticket(
        "01",
        "Start a group order and join with a code",
        "open",
      ),
      "work/group-a/issues/02-deadline.md": ticket(
        "02",
        "Close the order at the deadline",
        "open",
      ),
      "work/group-a/issues/03-host-places-it.md": ticket(
        "03",
        "The host places it as one order",
        "open",
      ),
    },
    { at: T("14:30"), message: "tickets" },
  );
  sha.a4 = commit(
    repo,
    {
      "work/group-a/issues/01-start-and-join.md": ticket(
        "01",
        "Start a group order and join with a code",
        "claimed",
      ),
      "case/api/GroupOrdersController.cs": "// controller\n",
      "case/api/Forkful.Api.Tests/GroupOrdersControllerTests.cs": "// tests\n",
    },
    { at: T("14:50"), message: "slice 1" },
  );
  sha.a5 = commit(
    repo,
    {
      "work/group-a/spec.md": SPEC + "\n- Joining twice is refused.\n",
      "case/api/GroupOrdersController.cs": "// controller, fixed\n",
    },
    { at: T("15:05"), message: "fix and spec" },
  );
  sha.a6 = commit(
    repo,
    { "case/api/GroupOrdersController.cs": "// controller, fixed again\n" },
    { at: T("15:20"), message: "fix" },
  );
  sha.a7 = commit(
    repo,
    {
      "work/group-a/issues/01-start-and-join.md": ticket(
        "01",
        "Start a group order and join with a code",
        "done",
      ),
    },
    { at: T("15:30"), message: "slice 1 done" },
  );
  sha.a8 = commit(
    repo,
    {
      "work/group-a/issues/02-deadline.md": ticket(
        "02",
        "Close the order at the deadline",
        "claimed",
      ),
      "work/group-a/issues/03-host-places-it.md": null,
      "work/group-a/issues/04-who-added-what.md": ticket(
        "04",
        "Show who added what",
        "open",
      ),
      "case/web/src/GroupOrderPage.tsx": "export {};\n",
      "case/web/src/GroupOrderPage.test.tsx": "// test\n",
      "case/web/src/App.tsx": "export const routes = [];\n",
      "case/api/Program.cs": "// app, with the controller registered\n",
      "case/GLOSSARY.md": "# Glossary\n",
      ".github/workflows/tests.yml": "name: Tests\non: push\n",
      ".agents/skills/check-deadline/SKILL.md":
        "---\nname: check-deadline\ndescription: Use when testing deadlines.\n---\n",
      "docs/group-orders.md": "# Group orders\n",
      "pnpm-lock.yaml": "lockfileVersion: '9.0'\npackages: {}\n",
    },
    { at: T("15:40"), message: "slice 2" },
  );
  sha.a9 = commit(
    repo,
    {
      "work/group-a/spec.md":
        SPEC + "\n- Joining twice is refused, politely.\n",
      "work/group-a/review.md": REVIEW,
      "work/group-a/issues/02-deadline.md": ticket(
        "02",
        "Close the order at the deadline",
        "done",
      ),
    },
    { at: T("16:00"), message: "review and slice 2 done" },
  );

  // Group B: its own base, and tickets whose Status lines never move.
  run(repo, ["switch", "-q", "-c", "group-b/main", sha.start]);
  sha.bBase = commit(
    repo,
    { "docs/agents/workshop.md": keysFor("group-b") },
    { at: T("09:05"), message: "group-b base" },
  );
  run(repo, ["switch", "-q", "-c", "group-b/group-orders"]);
  sha.b1 = commit(
    repo,
    {
      "work/group-b/spec.md": "# Spec\n",
      "work/group-b/issues/01-start-a-group-order.md": ticket(
        "01",
        "Start a group order",
        "open",
      ),
    },
    { at: T("13:00"), message: "spec and ticket" },
  );
  sha.b2 = commit(
    repo,
    { "case/api/GroupOrdersController.cs": "// controller\n" },
    { at: T("15:20"), message: "code" },
  );
  sha.b3 = commit(
    repo,
    { "case/api/GroupOrdersController.cs": "// controller, fixed\n" },
    { at: T("15:50"), message: "fix" },
  );
  run(repo, ["switch", "-q", "main"]);
});

after(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
});

const testRun = (conclusion, at, name = "test") => ({
  name,
  status: "completed",
  conclusion,
  completedAt: T(at),
});

const github = ({
  labels = [{ label: "spec-reviewed", action: "labeled", at: T("14:20") }],
} = {}) =>
  recordedGitHub({
    pullRequests: {
      12: {
        draft: true,
        headRef: "group-a/group-orders",
        baseRef: "group-a/main",
        headSha: sha.a9,
      },
      14: {
        draft: true,
        headRef: "group-b/group-orders",
        baseRef: "group-b/main",
        headSha: sha.b3,
      },
    },
    labelEvents: {
      12: [{ label: "epic", action: "labeled", at: T("11:21") }, ...labels],
      14: [{ label: "spec-reviewed", action: "labeled", at: T("13:50") }],
    },
    commitShas: {
      12: [
        sha.a1,
        sha.a2,
        sha.a3,
        sha.a4,
        sha.a5,
        sha.a6,
        sha.a7,
        sha.a8,
        sha.a9,
      ],
      14: [sha.b1, sha.b2, sha.b3],
    },
    checkRuns: {
      // The case's own tests are green before anyone writes code: those runs belong to no slice.
      [sha.a1]: [testRun("success", "11:25")],
      [sha.a2]: [testRun("success", "12:15")],
      [sha.a3]: [testRun("success", "14:35")],
      [sha.a4]: [testRun("failure", "14:55")],
      [sha.a5]: [
        testRun("cancelled", "15:07"),
        testRun("success", "15:08", "skills"),
        testRun("failure", "15:10"),
      ],
      [sha.a6]: [testRun("success", "15:25")],
      [sha.a7]: [testRun("success", "15:35")],
      [sha.a8]: [testRun("success", "15:45")],
      [sha.a9]: [testRun("failure", "16:05")],
      [sha.b1]: [testRun("success", "13:05")],
      [sha.b2]: [testRun("failure", "15:25")],
      [sha.b3]: [testRun("success", "15:55")],
    },
  });

const groupA = (options = {}) =>
  groupSignals({
    repoDir: repo,
    group: "group-a",
    base: "group-a/main",
    head: "group-a/group-orders",
    pr: 12,
    github: github(),
    ...options,
  });

const ref = (ticket, title) => ({ ticket, title });

test("computes all five signals for a group from its history and PR timeline", async () => {
  const signals = await groupA();

  assert.equal(signals.group, "group-a");
  assert.equal(signals.pr, 12);
  assert.equal(signals.from, sha.start);
  assert.equal(signals.head, sha.a9);
  assert.deepEqual(signals.timeToSpec, {
    labelledAt: T("14:20"),
    minutes: 105,
  });
  assert.deepEqual(signals.specRework.changes, [
    { sha: sha.a5, at: T("15:05") },
    { sha: sha.a9, at: T("16:00") },
  ]);
  assert.deepEqual(signals.firstPassCi.slices, [
    {
      ticket: "01-start-and-join.md",
      title: "Start a group order and join with a code",
      runs: [
        { sha: sha.a4, at: T("14:55"), result: "fail" },
        { sha: sha.a5, at: T("15:10"), result: "fail" },
        { sha: sha.a6, at: T("15:25"), result: "pass" },
      ],
    },
    {
      ticket: "02-deadline.md",
      title: "Close the order at the deadline",
      runs: [{ sha: sha.a8, at: T("15:45"), result: "pass" }],
    },
    {
      ticket: "04-who-added-what.md",
      title: "Show who added what",
      runs: [],
    },
  ]);
  assert.deepEqual(signals.reviewRounds, {
    rounds: 2,
    file: "work/group-a/review.md",
  });
  assert.deepEqual(signals.drift, {
    planned: [
      ref("01-start-and-join.md", "Start a group order and join with a code"),
      ref("02-deadline.md", "Close the order at the deadline"),
      ref("03-host-places-it.md", "The host places it as one order"),
    ],
    shipped: [
      ref("01-start-and-join.md", "Start a group order and join with a code"),
      ref("02-deadline.md", "Close the order at the deadline"),
    ],
    added: [ref("04-who-added-what.md", "Show who added what")],
    dropped: [ref("03-host-places-it.md", "The host places it as one order")],
    outsidePlan: [
      ".github/workflows/tests.yml",
      "case/api/Program.cs",
      "case/web/src/App.tsx",
    ],
  });
});

test("reads the same after the group merged its PR into a base that moved on", async () => {
  const before = await groupA();
  const merged = temp("team-signals-merged-");
  run(merged, ["clone", "-q", repo, "."]);
  for (const branch of ["group-a/main", "group-a/group-orders"])
    run(merged, ["branch", "-q", "-f", branch, `origin/${branch}`]);
  run(merged, ["config", "user.name", "Test"]);
  run(merged, ["config", "user.email", "test@example.com"]);
  run(merged, ["switch", "-q", "group-a/main"]);
  commit(
    merged,
    { ".github/workflows/reporter.yml": "name: Reporter\n" },
    { at: T("16:20"), message: "hotfix the reporter" },
  );
  run(
    merged,
    ["merge", "-q", "--no-ff", "-m", "Merge the PR", "group-a/group-orders"],
    {
      GIT_AUTHOR_DATE: T("17:00"),
      GIT_COMMITTER_DATE: T("17:00"),
    },
  );

  const after = await groupA({ repoDir: merged });

  assert.deepEqual(after, before);
});

test("a removed label means no checkpoint, so no time to spec and no rework", async () => {
  const labels = [
    { label: "spec-reviewed", action: "labeled", at: T("14:20") },
    { label: "spec-reviewed", action: "unlabeled", at: T("14:22") },
  ];
  const signals = await groupA({ github: github({ labels }) });

  assert.deepEqual(signals.timeToSpec, { labelledAt: null, minutes: null });
  assert.deepEqual(signals.specRework.changes, []);
  assert.equal(signals.firstPassCi.slices[0].runs.length, 3);
});

test("puts all runs in one entry when the tickets' Status lines never move", async () => {
  const signals = await groupSignals({
    repoDir: repo,
    group: "group-b",
    base: "group-b/main",
    head: "group-b/group-orders",
    pr: 14,
    github: github(),
  });

  assert.equal(signals.from, sha.bBase);
  assert.deepEqual(signals.timeToSpec, {
    labelledAt: T("13:50"),
    minutes: 90,
  });
  assert.deepEqual(signals.firstPassCi.slices, [
    {
      ticket: null,
      title: null,
      runs: [
        { sha: sha.b2, at: T("15:25"), result: "fail" },
        { sha: sha.b3, at: T("15:55"), result: "pass" },
      ],
    },
  ]);
  assert.deepEqual(signals.reviewRounds, { rounds: 0, file: null });
  assert.deepEqual(signals.drift.shipped, []);
});

test("offline, it still reads everything git knows", async () => {
  const signals = await groupA({ github: null });

  assert.deepEqual(signals.timeToSpec, { labelledAt: null, minutes: null });
  assert.deepEqual(
    signals.firstPassCi.slices.map((s) => [s.ticket, s.runs.length]),
    [
      ["01-start-and-join.md", 0],
      ["02-deadline.md", 0],
      ["04-who-added-what.md", 0],
    ],
  );
  assert.equal(signals.reviewRounds.rounds, 2);
  assert.equal(signals.drift.outsidePlan.length, 3);
});

test("lists the groups in fixed order, and the result matches the schema", async () => {
  const signals = await teamSignals({
    repoDir: repo,
    github: github(),
    computedAt: "2026-10-28T05:30:00+01:00",
    groups: [
      {
        group: "group-b",
        base: "group-b/main",
        head: "group-b/group-orders",
        pr: 14,
      },
      {
        group: "group-a",
        base: "group-a/main",
        head: "group-a/group-orders",
        pr: 12,
      },
    ],
  });

  assert.deepEqual(
    signals.groups.map((g) => g.group),
    ["group-a", "group-b"],
  );
  assert.equal(signals.kickoff, "11:10");
  assert.deepEqual(signals.lunch, { from: "12:40", to: "14:05" });
  assert.equal(signals.timeZone, "Europe/Amsterdam");

  const doc = JSON.parse(
    fs.readFileSync(path.join(here, "fixtures", "retrospective.json"), "utf8"),
  );
  assert.deepEqual(checkRetrospective({ ...doc, signals }), []);
});

function dataCheckout() {
  const remote = temp("signals-remote-");
  run(remote, ["init", "-q", "--bare", "-b", "main"]);
  const source = temp("signals-source-");
  initRepo(source);
  commit(source, { "README.md": "# Workshop\n" }, { at: T("08:00") });
  run(source, ["remote", "add", "origin", remote]);
  run(source, ["push", "-q", "origin", "main"]);
  initDataBranch({ repoDir: source });
  const data = temp("signals-data-");
  run(data, ["clone", "-q", "-b", DATA_BRANCH, remote, "."]);
  run(data, ["config", "user.name", "Test"]);
  run(data, ["config", "user.email", "test@example.com"]);
  return { remote, data };
}

test("writes the signals into the data branch and keeps the synthesis", async () => {
  const { remote, data } = dataCheckout();
  const synthesis = JSON.parse(
    fs.readFileSync(path.join(here, "fixtures", "retrospective.json"), "utf8"),
  );
  fs.writeFileSync(
    path.join(data, "retrospective.json"),
    JSON.stringify(synthesis, null, 2) + "\n",
  );
  run(data, ["add", "retrospective.json"]);
  run(data, ["commit", "-q", "-m", "the synthesis"]);
  run(data, ["push", "-q", "origin", `HEAD:${DATA_BRANCH}`]);

  const signals = await teamSignals({
    repoDir: repo,
    github: github(),
    groups: [
      {
        group: "group-a",
        base: "group-a/main",
        head: "group-a/group-orders",
        pr: 12,
      },
    ],
  });
  const result = publishSignals({ dataDir: data, signals });

  assert.equal(result.file, "retrospective.json");
  assert.equal(result.pushed, true);
  const published = JSON.parse(
    run(remote, ["show", `${DATA_BRANCH}:retrospective.json`]),
  );
  assert.deepEqual(published.signals, signals);
  assert.equal(published.status, "draft");
  for (const section of [
    "sources",
    "routes",
    "isThisYou",
    "decisions",
    "driving",
    "mistakes",
    "shortlist",
  ])
    assert.deepEqual(published[section], synthesis[section], section);
});

test("starts a new retrospective when there is none, and refuses one that doesn't match the schema", async () => {
  const { remote, data } = dataCheckout();
  const signals = await teamSignals({
    repoDir: repo,
    github: null,
    groups: [
      {
        group: "group-b",
        base: "group-b/main",
        head: "group-b/group-orders",
        pr: null,
      },
    ],
  });

  publishSignals({ dataDir: data, signals });
  const published = JSON.parse(
    run(remote, ["show", `${DATA_BRANCH}:retrospective.json`]),
  );
  assert.equal(published.status, "signals");
  assert.deepEqual(published.routes, []);
  assert.equal(published.signals.groups[0].pr, null);

  const broken = { ...signals, groups: [{ ...signals.groups[0], pr: "14" }] };
  assert.throws(
    () => publishSignals({ dataDir: data, signals: broken }),
    /signals\/groups\/0\/pr: must be integer or null/,
  );
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(data, "retrospective.json"), "utf8")),
    published,
    "a refused write leaves the last good file",
  );
});

test("the schema wants evidence on every claim", () => {
  const doc = JSON.parse(
    fs.readFileSync(path.join(here, "fixtures", "retrospective.json"), "utf8"),
  );
  assert.deepEqual(checkRetrospective(doc), []);

  doc.isThisYou[0].evidence = [];
  doc.mistakes[0].evidence = [{ kind: "file", file: "work/group-a/spec.md" }];
  doc.shortlist[0].confidence = "certain";
  const errors = checkRetrospective(doc);

  assert.ok(
    errors.includes("/isThisYou/0: a claim needs at least one evidence item"),
  );
  assert.ok(
    errors.includes(
      "/mistakes/0/evidence/0: must match exactly one allowed shape",
    ),
  );
  assert.ok(
    errors.some((e) => e.startsWith("/shortlist/0/confidence: must be one of")),
  );
});

test("the command line reads the bases and work branches and commits the result", () => {
  const { data } = dataCheckout();
  const out = execFileSync(
    process.execPath,
    [
      SCRIPT,
      "--offline",
      "--remote=",
      "--groups",
      "group-a,group-b,group-z",
      "--data-dir",
      data,
      "--no-push",
    ],
    { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  assert.match(out, /^group-a: no label · 0 spec changes after/m);
  assert.match(out, /Wrote retrospective\.json\./);
  const written = JSON.parse(
    fs.readFileSync(path.join(data, "retrospective.json"), "utf8"),
  );
  assert.deepEqual(
    written.signals.groups.map((g) => [g.group, g.head]),
    [
      ["group-a", sha.a9],
      ["group-b", sha.b3],
    ],
  );
  assert.equal(
    run(data, ["log", "-1", "--format=%s"]),
    "Team signals for group-a, group-b",
  );
});

test("working minutes run from the kickoff on the workshop's clock, without lunch", () => {
  assert.equal(workingMinutes(T("09:30")), 0, "before the kickoff");
  assert.equal(workingMinutes(T("12:00")), 50);
  assert.equal(
    workingMinutes(T("13:00")),
    90,
    "during lunch, lunch so far is out",
  );
  assert.equal(workingMinutes(T("14:20")), 105);
  assert.equal(
    workingMinutes("2026-10-27T13:20:59Z"),
    105,
    "UTC, whole minutes",
  );
  assert.equal(
    workingMinutes("2026-06-15T14:20:00+02:00"),
    105,
    "summer time reads the same wall clock",
  );
});

test("reads Status lines and titles the way the tickets write them", () => {
  assert.equal(statusOf("# 01: X\n\n**Status:** claimed\n"), "claimed");
  assert.equal(statusOf("Status: Done\n"), "done");
  assert.equal(statusOf("**Status**: open\n"), "open");
  assert.equal(statusOf("- Status: done\n"), "done");
  assert.equal(statusOf("No status here\n"), null);
  assert.equal(
    titleOf("01-start.md", "# 01: Start a group order\n"),
    "Start a group order",
  );
  assert.equal(
    titleOf("02-close-at-the-deadline.md", "No heading\n"),
    "close at the deadline",
  );
});

test("a changed file is in the plan when the plan names it", () => {
  const plan =
    "A group orders controller, and the kitchen notes in `docs/kitchen.md`.";
  assert.equal(inPlan("case/api/GroupOrdersController.cs", plan), true);
  assert.equal(
    inPlan("case/api/Forkful.Api.Tests/GroupOrdersControllerTests.cs", plan),
    true,
  );
  assert.equal(inPlan("docs/kitchen.md", plan), true, "named by its path");
  assert.equal(inPlan("case/api/Program.cs", plan), false);
  assert.equal(
    inPlan("case/web/src/GroupOrderPage.tsx", "A group-order pages approach"),
    true,
    "words, whatever the case, hyphens or plural",
  );
  assert.equal(
    inPlan("case/web/src/App.tsx", "A page in the web app"),
    false,
    "one word in prose doesn't name a file",
  );
  assert.equal(
    inPlan("case/web/src/App.tsx", "Add a route in `App.tsx`"),
    true,
  );
  assert.equal(
    inPlan(".github/workflows/group-orders.yml", plan),
    false,
    "outside the case only by its path",
  );
});
