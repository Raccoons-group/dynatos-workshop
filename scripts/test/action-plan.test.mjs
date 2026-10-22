import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  parseChosen,
  parseRowDraft,
  PLAN_SCHEMA,
  planAt,
  refreshPlan,
} from "../action-plan.mjs";
import { loadSchema, validate } from "../lib/schema.mjs";
import { DATA_BRANCH, initDataBranch } from "../publish-live-data.mjs";
import { commit, initRepo, run, tempDir } from "./helpers/repo.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const fixtureFile = path.join(
  root,
  "scripts",
  "test",
  "fixtures",
  "day2",
  "action-plan.json",
);
const template = (file) =>
  fs.readFileSync(path.join(root, "docs", "action-plan", file), "utf8");
const README = template("README.md");
const ROW_TEMPLATE = template("row-template.md");
const OWNER = "Alex Example";
const T = (time) => `2026-10-28T${time}:00+01:00`;

const CONTEXT = `# Context row, drafted by group A

## Quick win candidates (done within 2 weeks)

- A short AGENTS.md per service: the agent guessed the test command twice
- A glossary page in each repo: two cards ask for it

## Longer step candidates (done within 3 months)

- ADRs for the decisions we keep re-explaining: a card, and the lab's AGENTS.md PR
`;

// A draft that kept a placeholder and went one candidate over.
const SKILLS = ROW_TEMPLATE.replace("<Context / Skills / Checks>", "Skills")
  .replace("group <x>", "group b")
  .replace(
    "- <item>: <why, pointing at a shortlist item, a card or a lab PR>\n- … (up to 3)",
    [
      "- Finish the lab's open skill PRs: they're one review away",
      "- Port read-issue to our tracker: the plan's open question",
      "- A release-notes skill: three cards",
      "- A fourth candidate: one too many",
    ].join("\n"),
  )
  .replace(
    "- … (up to 3)",
    "- A build skill per repo: every card about builds",
  );

// After the vote: winners in the grid, with owners the deck must never show.
const VOTED = README.replace(
  /^\| Route: the gates and stations we keep \|.*$/m,
  `| Route: the gates and stations we keep | Spec review before any code | ${OWNER} | 2026-11-12 | | | |`,
).replace(
  /^\| Context +\|.*$/m,
  `| Context | A short AGENTS.md per service | ${OWNER} | 2026-11-12 | | | |`,
);

const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};
after(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
});

describe("reading the row drafts", () => {
  test("candidates as item and why, up to three, without the template's placeholders", () => {
    assert.deepEqual(parseRowDraft(SKILLS), {
      draftedBy: "group-b",
      quickWins: [
        {
          item: "Finish the lab's open skill PRs",
          why: "they're one review away",
        },
        {
          item: "Port read-issue to our tracker",
          why: "the plan's open question",
        },
        { item: "A release-notes skill", why: "three cards" },
      ],
      longerSteps: [
        { item: "A build skill per repo", why: "every card about builds" },
      ],
    });
  });

  test("the untouched row template drafts nothing", () => {
    assert.deepEqual(parseRowDraft(ROW_TEMPLATE), {
      draftedBy: null,
      quickWins: [],
      longerSteps: [],
    });
  });

  test("the untouched README has no winners, and a voted one never yields an owner", () => {
    assert.deepEqual(parseChosen(README), {
      route: { quickWin: null, longerStep: null },
      context: { quickWin: null, longerStep: null },
      skills: { quickWin: null, longerStep: null },
      checks: { quickWin: null, longerStep: null },
    });
    const voted = parseChosen(VOTED);
    assert.deepEqual(voted.context, {
      quickWin: "A short AGENTS.md per service",
      longerStep: null,
    });
    assert.equal(JSON.stringify(voted).includes(OWNER), false);
  });
});

describe("the grid from main", () => {
  let remote;
  let coach;
  let group;
  let data;

  beforeEach(() => {
    remote = temp("remote-");
    run(remote, ["init", "-q", "--bare", "-b", "main"]);

    // main as the cut leaves it: the two templates.
    group = temp("group-");
    initRepo(group);
    commit(
      group,
      {
        "docs/action-plan/README.md": README,
        "docs/action-plan/row-template.md": ROW_TEMPLATE,
      },
      { at: T("08:00"), message: "templates" },
    );
    run(group, ["remote", "add", "origin", remote]);
    run(group, ["push", "-q", "origin", "main"]);

    coach = temp("coach-");
    run(coach, ["clone", "-q", remote, "."]);
    initDataBranch({ repoDir: coach });
    data = path.join(temp("publish-"), "checkout");
  });

  // A group's row PR, merged on GitHub: it reaches main, never the coach's own checkout.
  function merge(files, time) {
    commit(group, files, { at: T(time), message: "merge a row" });
    run(group, ["push", "-q", "origin", "main"]);
  }
  const remotePlan = () =>
    JSON.parse(run(remote, ["show", `${DATA_BRANCH}:action-plan.json`]));

  test("templates alone make an empty grid", () => {
    const { doc } = refreshPlan({
      repoDir: coach,
      dataDir: data,
      now: new Date(T("11:37")),
    });

    assert.deepEqual(doc.rows, []);
    assert.deepEqual(remotePlan().rows, []);
  });

  test("each merged draft fills its row, in the grid's order", () => {
    refreshPlan({ repoDir: coach, dataDir: data, now: new Date(T("11:37")) });
    merge({ "docs/action-plan/skills.md": SKILLS }, "11:52");
    merge({ "docs/action-plan/context.md": CONTEXT }, "11:55");

    const { changed, pushed } = refreshPlan({
      repoDir: coach,
      dataDir: data,
      now: new Date(T("11:56")),
    });

    assert.deepEqual([changed, pushed], [true, true]);
    const plan = remotePlan();
    assert.deepEqual(
      plan.rows.map((row) => [row.thread, row.draftedBy]),
      [
        ["context", "group-a"],
        ["skills", "group-b"],
      ],
    );
    assert.equal(plan.updatedAt, "2026-10-28T10:56:00.000Z");
    assert.deepEqual(validate(loadSchema(PLAN_SCHEMA), plan), []);
  });

  test("the vote's winners arrive with the README, without the owners", () => {
    merge(
      {
        "docs/action-plan/skills.md": SKILLS,
        "docs/action-plan/context.md": CONTEXT,
      },
      "11:55",
    );
    merge({ "docs/action-plan/README.md": VOTED }, "12:10");

    refreshPlan({ repoDir: coach, dataDir: data, now: new Date(T("12:10")) });
    const plan = remotePlan();

    assert.deepEqual(
      plan.rows.map((row) => [row.thread, row.chosen.quickWin]),
      [
        ["route", "Spec review before any code"],
        ["context", "A short AGENTS.md per service"],
        ["skills", null],
      ],
    );
    assert.equal(JSON.stringify(plan).includes(OWNER), false);
    const { updatedAt, ...rest } = plan;
    const { updatedAt: _, ...fixture } = JSON.parse(
      fs.readFileSync(fixtureFile, "utf8"),
    );
    assert.deepEqual(rest, fixture, "the fixture the deck is tested with");
  });

  test("an unchanged main commits nothing", () => {
    merge({ "docs/action-plan/context.md": CONTEXT }, "11:55");
    refreshPlan({ repoDir: coach, dataDir: data, now: new Date(T("11:56")) });
    const commits = () => run(remote, ["rev-list", "--count", DATA_BRANCH]);
    const before = commits();

    const again = refreshPlan({
      repoDir: coach,
      dataDir: data,
      now: new Date(T("11:57")),
    });

    assert.equal(again.changed, false);
    assert.equal(commits(), before);
  });

  test("reads only what's on main at the ref it's given", () => {
    merge({ "docs/action-plan/context.md": CONTEXT }, "11:55");
    run(coach, ["fetch", "-q", "origin"]);

    assert.deepEqual(
      planAt({ repoDir: coach, ref: "origin/main" }).rows.map((r) => r.thread),
      ["context"],
    );
    assert.deepEqual(planAt({ repoDir: coach, ref: "HEAD" }).rows, []);
  });
});

test("the fixture the deck uses matches the schema", () => {
  assert.deepEqual(
    validate(
      loadSchema(PLAN_SCHEMA),
      JSON.parse(fs.readFileSync(fixtureFile, "utf8")),
    ),
    [],
  );
});
