import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import { liveGitHub, recordedGitHub } from "../lib/github.mjs";
import { loadSchema, validate } from "../lib/schema.mjs";
import {
  fixLevelFrom,
  libraryEntries,
  LIBRARY_SCHEMA,
  publishLibrary,
  toolsPassed,
  usesLabTemplate,
} from "../library-list.mjs";
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
  "library.json",
);
const LAB_TEMPLATE = fs.readFileSync(
  path.join(root, ".github", "PULL_REQUEST_TEMPLATE", "lab.md"),
  "utf8",
);
const TESTS_TEMPLATE = fs.readFileSync(
  path.join(root, "docs", "tests-md-template.md"),
  "utf8",
);
const OWNER = "jdoe-dev";
const T = (day, time) => `2026-10-${day}T${time}:00+01:00`;

// A pair fills in the lab template: the "What it catches" line, one ticked fix level.
const labBody = (catches, level) =>
  LAB_TEMPLATE.replace(/^<one line: [^\n]*>$/m, catches).replace(
    `- [ ] ${level}`,
    `- [x] ${level}`,
  );

const skillMd = (name, description) =>
  `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n`;

// One TESTS.md column per tool: a string of three marks per section, "y" ✅, "n" ❌, "-" not run.
function testsMd(columns) {
  const cell = (mark) => ({ y: "✅", n: "❌ fired", "-": "" })[mark];
  const table = (prompts, section) =>
    [
      "| Prompt | Claude Code | Codex | Copilot |",
      "| - | - | - | - |",
      ...prompts.map(
        (prompt, i) =>
          `| ${prompt} | ${["claude", "codex", "copilot"].map((tool) => cell(columns[tool]?.[section][i] ?? "-")).join(" | ")} |`,
      ),
    ].join("\n");
  return [
    `Owner: ${OWNER}. Review: 2026-11-25.`,
    "",
    "## Should fire",
    table(["Push this", "Open the PR for this slice", "We're done here"], 0),
    "",
    "## Should not fire",
    table(
      ["Run only the web tests", "Explain this diff", "Rename this file"],
      1,
    ),
    "",
    "## With and without",
    "Task: finish a slice. Without the skill: pushed with a red suite. With it: both suites ran first.",
    "",
  ].join("\n");
}

const pr = (number, fields) => ({
  number,
  title: `PR ${number}`,
  body: "",
  state: "open",
  draft: false,
  baseRef: "main",
  headRef: `lab/pr-${number}`,
  headSha: `${number}`.padStart(7, "a"),
  createdAt: T(28, "10:40"),
  mergedAt: null,
  ...fields,
});

function recorded() {
  const prs = [
    pr(39, {
      title: "Hotfix the grilling skill's description",
      state: "merged",
      createdAt: T(27, "08:10"),
      headRef: "coach/grilling-fix",
    }),
    pr(40, { title: "Typo in REVIEW.md", state: "merged" }),
    pr(41, {
      title: "run-both-suites",
      body: labBody(
        "Pushes with one suite red: a wrong-twice item",
        "Procedure → skill",
      ),
      state: "merged",
      createdAt: T(28, "10:41"),
    }),
    pr(42, {
      title: "Lockfile guard",
      body: labBody(
        "A lockfile committed without the package.json change behind it",
        "A check (lint or CI): it fails, with an error that names the fix",
      ),
      createdAt: T(28, "10:44"),
    }),
    pr(43, {
      title: "explain-test-failure",
      body: "Explains a red test run before anyone touches the code.",
      createdAt: T(28, "10:47"),
    }),
    pr(44, {
      title: "Sharper code-review triggers",
      body: "## What it catches\nReviews that started without a fixed point\n\n## Fix level\nprocedure → skill\n",
      state: "merged",
      createdAt: T(28, "10:49"),
    }),
    pr(45, {
      title: "Abandoned skill",
      state: "closed",
      createdAt: T(28, "10:50"),
    }),
    pr(46, {
      title: "A group's skill",
      baseRef: "group-a/main",
      createdAt: T(27, "15:00"),
    }),
    pr(47, {
      title: "Test project names in the AGENTS.md template",
      body: "## What it catches\n- Agents guessing the test project's name\n\n## Fix level\nAGENTS.md line: no check can tell a guessed name from a real one\n",
      state: "merged",
      createdAt: T(28, "10:52"),
    }),
  ];
  const files = (list) =>
    list.map(([status, file]) => ({ path: file, status }));
  const at = (number, file) => `${`${number}`.padStart(7, "a")}:${file}`;
  return recordedGitHub({
    pullRequestList: prs,
    pullRequestFiles: {
      39: files([["modified", ".agents/skills/grilling/SKILL.md"]]),
      40: files([["modified", "REVIEW.md"]]),
      41: files([
        ["added", ".agents/skills/run-both-suites/SKILL.md"],
        ["added", ".agents/skills/run-both-suites/TESTS.md"],
      ]),
      42: files([
        ["added", "scripts/check-lockfile.mjs"],
        ["modified", ".github/workflows/guard.yml"],
      ]),
      43: files([
        ["added", ".agents/skills/explain-test-failure/SKILL.md"],
        ["added", ".agents/skills/explain-test-failure/TESTS.md"],
        ["modified", ".agents/skills/README.md"],
      ]),
      44: files([
        ["modified", ".agents/skills/code-review/SKILL.md"],
        ["added", ".agents/skills/code-review/TESTS.md"],
      ]),
      45: files([["added", ".agents/skills/abandoned/SKILL.md"]]),
      46: files([["added", ".agents/skills/group-skill/SKILL.md"]]),
      47: files([["modified", "docs/agents-md-template.md"]]),
    },
    files: {
      [at(39, ".agents/skills/grilling/SKILL.md")]: skillMd(
        "grilling",
        "Use when the user wants to stress-test a plan.",
      ),
      [at(41, ".agents/skills/run-both-suites/SKILL.md")]: skillMd(
        "run-both-suites",
        "Use when about to push or say done: runs the API and web suites and reports both.",
      ),
      [at(41, ".agents/skills/run-both-suites/TESTS.md")]: testsMd({
        claude: ["yyy", "yyy"],
        copilot: ["yyy", "ynn"],
      }),
      [at(43, ".agents/skills/explain-test-failure/SKILL.md")]: skillMd(
        "explain-test-failure",
        ">\n  Use when a test run is red and the group asks why,\n  before any code changes.",
      ),
      [at(43, ".agents/skills/explain-test-failure/TESTS.md")]: testsMd({
        claude: ["yyy", "yyy"],
        codex: ["yny", "yyy"],
      }),
      [at(44, ".agents/skills/code-review/SKILL.md")]: skillMd(
        "code-review",
        "Use when the group asks for a review of its changes since a fixed point.",
      ),
      [at(44, ".agents/skills/code-review/TESTS.md")]: testsMd({
        codex: ["yyy", "yyy"],
        copilot: ["yyy", "yyy"],
      }),
    },
  });
}

const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};
after(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
});

describe("the lab PRs into main", () => {
  test("one entry per lab PR, in the order they were opened", async () => {
    const entries = await libraryEntries({ github: recorded() });

    assert.deepEqual(
      entries.map((entry) => [entry.pr, entry.name, entry.kind, entry.state]),
      [
        [39, "grilling", "skill", "merged"],
        [41, "run-both-suites", "skill", "merged"],
        [42, "Lockfile guard", "fix", "open"],
        [43, "explain-test-failure", "skill", "open"],
        [44, "code-review", "skill", "merged"],
        [47, "Test project names in the AGENTS.md template", "fix", "merged"],
      ],
      "no closed PR, no PR into a group base, no PR that's neither a skill nor a lab template",
    );
  });

  test("--since leaves out what came into main before the lab", async () => {
    const entries = await libraryEntries({
      github: recorded(),
      since: T(28, "09:45"),
    });

    assert.deepEqual(
      entries.map((entry) => entry.pr),
      [41, 42, 43, 44, 47],
    );
  });

  test("matches the fixture the deck is tested with", async () => {
    const entries = await libraryEntries({
      github: recorded(),
      since: T(28, "09:45"),
    });

    assert.deepEqual(
      entries,
      JSON.parse(fs.readFileSync(fixtureFile, "utf8")).entries,
    );
  });

  test("fix level, what it catches and the tools that passed", async () => {
    const byPr = Object.fromEntries(
      (await libraryEntries({ github: recorded() })).map((e) => [e.pr, e]),
    );

    assert.equal(byPr[41].fixLevel, "skill");
    assert.equal(
      byPr[41].catches,
      "Use when about to push or say done: runs the API and web suites and reports both.",
      "a skill's first description line",
    );
    assert.deepEqual(byPr[41].toolsPassed, ["Claude Code", "Copilot"]);

    assert.equal(byPr[42].fixLevel, "check");
    assert.equal(
      byPr[42].catches,
      "A lockfile committed without the package.json change behind it",
    );
    assert.deepEqual(byPr[42].toolsPassed, [], "a fix has no trigger tests");

    assert.equal(byPr[43].fixLevel, "skill", "a skill PR without a fix level");
    assert.equal(
      byPr[43].catches,
      "Use when a test run is red and the group asks why, before any code changes.",
    );
    assert.deepEqual(
      byPr[43].toolsPassed,
      ["Claude Code"],
      "one missed prompt fails Codex",
    );

    assert.deepEqual(byPr[44].toolsPassed, ["Codex", "Copilot"]);
    assert.equal(byPr[47].fixLevel, "AGENTS.md");
    assert.equal(byPr[47].catches, "Agents guessing the test project's name");
  });

  test("shows no names: not the owner, not the author", async () => {
    const github = recorded();
    const entries = await libraryEntries({ github });

    assert.equal(JSON.stringify(entries).includes(OWNER), false);
    for (const entry of entries)
      assert.deepEqual(Object.keys(entry).sort(), [
        "catches",
        "fixLevel",
        "kind",
        "name",
        "openedAt",
        "pr",
        "state",
        "toolsPassed",
      ]);
  });

  test("reads a PR's files once per head commit across watch runs", async () => {
    const github = recorded();
    let calls = 0;
    const counting = {
      ...github,
      pullRequestFiles: async (number) => {
        calls++;
        return github.pullRequestFiles(number);
      },
    };
    const cache = new Map();

    await libraryEntries({ github: counting, cache });
    const first = calls;
    await libraryEntries({ github: counting, cache });

    assert.equal(first, 7, "every open or merged PR into main");
    assert.equal(calls, first, "nothing new: no new calls");
  });
});

describe("the templates and what the list reads from them", () => {
  test("the untouched lab template says nothing yet", () => {
    assert.equal(usesLabTemplate(LAB_TEMPLATE), true);
    assert.equal(fixLevelFrom(LAB_TEMPLATE), null);
  });

  test("each ticked fix level", () => {
    for (const [line, level] of [
      ["Architecture: the mistake can't be made at all", "architecture"],
      ["Types: the compiler rejects it", "types"],
      [
        "A check (lint or CI): it fails, with an error that names the fix",
        "check",
      ],
      ["A test: it catches it after the fact", "test"],
      [
        "An AGENTS.md line: last, because a rule in a doc fails silently",
        "AGENTS.md",
      ],
      ["Procedure → skill", "skill"],
    ])
      assert.equal(fixLevelFrom(labBody("x", line)), level, line);
  });

  test("a written fix level, without boxes, and never from the why-not-higher line", () => {
    assert.equal(
      fixLevelFrom(
        "## Fix level\nWhy not higher: types can't say it\ntest: it runs after the fact\n",
      ),
      "test",
    );
  });

  test("the untouched TESTS.md template passes no tool", () => {
    assert.deepEqual(toolsPassed(TESTS_TEMPLATE), []);
  });

  test("a tool needs at least three ticked should-fire prompts", () => {
    const two = [
      "## Should fire",
      "| Prompt | Claude Code |",
      "| - | - |",
      "| Push this | ✅ |",
      "| Ship it | ✅ |",
    ].join("\n");

    assert.deepEqual(toolsPassed(two), []);
  });
});

describe("publishing library.json", () => {
  let remote;
  let data;

  beforeEach(() => {
    remote = temp("remote-");
    run(remote, ["init", "-q", "--bare", "-b", "main"]);
    const repo = temp("repo-");
    initRepo(repo);
    commit(repo, { "README.md": "# Workshop\n" }, { at: T(28, "08:00") });
    run(repo, ["remote", "add", "origin", remote]);
    run(repo, ["push", "-q", "origin", "main"]);
    initDataBranch({ repoDir: repo });
    data = temp("data-");
    run(data, ["clone", "-q", "-b", DATA_BRANCH, remote, "."]);
  });

  const remoteLibrary = () =>
    JSON.parse(run(remote, ["show", `${DATA_BRANCH}:library.json`]));
  const commits = () =>
    Number(run(remote, ["rev-list", "--count", DATA_BRANCH]));

  test("writes library.json at the top of the data branch, valid against its schema", async () => {
    const result = await publishLibrary({
      github: recorded(),
      dataDir: data,
      now: new Date(T(28, "10:55")),
    });

    assert.equal(result.pushed, true);
    const library = remoteLibrary();
    assert.deepEqual(validate(loadSchema(LIBRARY_SCHEMA), library), []);
    assert.equal(library.updatedAt, "2026-10-28T09:55:00.000Z");
    assert.equal(library.entries.length, 6);
  });

  test("commits only when the list changed", async () => {
    await publishLibrary({
      github: recorded(),
      dataDir: data,
      now: new Date(T(28, "10:55")),
    });
    const before = commits();

    const again = await publishLibrary({
      github: recorded(),
      dataDir: data,
      now: new Date(T(28, "10:56")),
    });
    assert.equal(again.changed, false);
    assert.equal(commits(), before);
    assert.equal(remoteLibrary().updatedAt, "2026-10-28T09:55:00.000Z");

    const github = recorded();
    const list = await github.pullRequests({ base: "main" });
    list.find((p) => p.number === 42).state = "merged";
    const merged = await publishLibrary({
      github: { ...github, pullRequests: async () => list },
      dataDir: data,
      now: new Date(T(28, "11:05")),
    });
    assert.equal(merged.changed, true);
    assert.equal(commits(), before + 1);
    assert.equal(
      remoteLibrary().entries.find((e) => e.pr === 42).state,
      "merged",
    );
  });

  test("a list committed while offline is pushed on the next run", async () => {
    const offline = await publishLibrary({
      github: recorded(),
      dataDir: data,
      push: false,
      now: new Date(T(28, "10:55")),
    });
    assert.deepEqual([offline.committed, offline.pushed], [true, false]);

    const online = await publishLibrary({
      github: recorded(),
      dataDir: data,
      now: new Date(T(28, "10:56")),
    });

    assert.deepEqual([online.changed, online.pushed], [false, true]);
    assert.equal(remoteLibrary().updatedAt, "2026-10-28T09:55:00.000Z");
  });
});

test("the fixture the deck uses matches the schema", () => {
  assert.deepEqual(
    validate(
      loadSchema(LIBRARY_SCHEMA),
      JSON.parse(fs.readFileSync(fixtureFile, "utf8")),
    ),
    [],
  );
});

// The live adapter's PR methods, against responses shaped like GitHub's REST API.
describe("the live adapter", () => {
  const rest = {
    "/pulls?state=all&sort=created&direction=asc&base=main&per_page=100": {
      body: [
        {
          number: 41,
          title: "run-both-suites",
          body: null,
          state: "closed",
          merged_at: "2026-10-28T10:03:00Z",
          draft: false,
          base: { ref: "main" },
          head: { ref: "lab/run-both-suites", sha: "abc1234" },
          created_at: "2026-10-28T09:41:00Z",
          user: { login: OWNER },
        },
      ],
      next: "https://api.github.com/repos/o/r/pulls?page=2",
    },
    "/pulls?page=2": {
      body: [
        {
          number: 45,
          title: "Abandoned",
          body: "",
          state: "closed",
          merged_at: null,
          draft: true,
          base: { ref: "main" },
          head: { ref: "lab/abandoned", sha: "def5678" },
          created_at: "2026-10-28T09:50:00Z",
        },
      ],
    },
    "/pulls/41/files?per_page=100": {
      body: [
        {
          filename: ".agents/skills/run-both-suites/SKILL.md",
          status: "added",
        },
      ],
    },
    "/contents/.agents/skills/run-both-suites/TESTS.md?ref=abc1234": {
      text: "Owner: someone.\n",
    },
  };
  const seen = [];
  const fetchImpl = async (url, { headers }) => {
    seen.push(headers);
    const key = url.replace("https://api.github.com/repos/o/r", "");
    const hit = rest[key];
    if (!hit) return { ok: false, status: 404 };
    return {
      ok: true,
      status: 200,
      headers: {
        get: (name) =>
          name === "link" && hit.next ? `<${hit.next}>; rel="next"` : null,
      },
      json: async () => hit.body,
      text: async () => hit.text,
    };
  };
  const github = liveGitHub({ repo: "o/r", token: "t0ken", fetchImpl });

  test("lists every page of PRs into a base, with merged told apart from closed", async () => {
    const prs = await github.pullRequests({ base: "main" });

    assert.deepEqual(
      prs.map((p) => [p.number, p.state, p.body, p.headSha, p.draft]),
      [
        [41, "merged", "", "abc1234", false],
        [45, "closed", "", "def5678", true],
      ],
    );
    assert.equal(JSON.stringify(prs).includes(OWNER), false, "no author");
  });

  test("a PR's files, and a file's raw text at a commit or null", async () => {
    assert.deepEqual(await github.pullRequestFiles(41), [
      { path: ".agents/skills/run-both-suites/SKILL.md", status: "added" },
    ]);
    assert.equal(
      await github.fileAt(".agents/skills/run-both-suites/TESTS.md", "abc1234"),
      "Owner: someone.\n",
    );
    assert.equal(await github.fileAt("nope.md", "abc1234"), null);
    assert.equal(seen.at(-1).Accept, "application/vnd.github.raw+json");
    assert.equal(seen.at(-1).Authorization, "Bearer t0ken");
  });
});
