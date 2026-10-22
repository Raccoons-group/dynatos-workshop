// The cut and the hotfix, on a fixture repo with a local bare remote (seam 2). Installs and test runs are
// stubbed: the cut's own checks are what's under test.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, describe, test } from "node:test";

import {
  BASES,
  CASE_START,
  REQUIRED,
  SAY_IT_BACK,
  coachOnlyFiles,
  cut,
  matchesPattern,
  pruneRootScripts,
  pushCut,
} from "../cut.mjs";
import { hotfix } from "../hotfix.mjs";
import { parseWorkshopKeys } from "../lib/workshop-keys.mjs";
import { commit, initRepo, run, tempDir } from "./helpers/repo.mjs";

const TERMS = ["Zorblax"];
const T = "2026-10-22T10:00:00+02:00";
const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};
after(() =>
  dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

const quiet = () => {};
const noLockfile = () => {};

function mainRepo(extra = {}) {
  const dir = temp("main-");
  initRepo(dir);
  const files = Object.fromEntries(REQUIRED.map((file) => [file, `${file}\n`]));
  commit(
    dir,
    {
      ...files,
      "README.md": "# The workshop repo\n",
      "case/README.md": "# Forkful\n\nRun every command from the repo root.\n",
      "case/api/Program.cs":
        "// The Zorblax lives here, where groups find it.\n",
      "docs/agents/workshop.md":
        "# This branch\n\nGroup: none\nBase branch: main\nWork branch: none\nWorking-out: none\nEpic: none\n",
      "package.json": JSON.stringify({
        name: "w",
        scripts: {
          test: "turbo run test",
          "live:sync": "node scripts/live-sync.mjs",
          "setup:check": "node scripts/setup-check.mjs",
        },
      }),
      ".scratch/workshop/map.md": "# Map\n",
      "apps/deck/slides.md": "# Deck\n",
      "scripts/live-sync.mjs": "// coach\n",
      "scripts/test/live-sync.test.mjs": "// coach\n",
      "scripts/setup-check.mjs": "// participants\n",
      "scripts/coach-only.txt":
        "# coach-only\n.scratch/\napps/deck/\nscripts/coach-only.txt\nscripts/live-sync.mjs\nscripts/test/live-*.test.mjs\n",
      ...extra,
    },
    { at: T, message: "main" },
  );
  return dir;
}

describe("the manifest", () => {
  test("folders, exact paths and * within a segment", () => {
    assert.ok(matchesPattern(".scratch/", ".scratch/workshop/map.md"));
    assert.ok(matchesPattern("scripts/cut.mjs", "scripts/cut.mjs"));
    assert.ok(!matchesPattern("scripts/cut.mjs", "scripts/cut.mjs.bak"));
    assert.ok(
      matchesPattern(
        "scripts/test/live-*.test.mjs",
        "scripts/test/live-sync.test.mjs",
      ),
    );
    assert.ok(
      !matchesPattern(
        "scripts/test/live-*.test.mjs",
        "scripts/test/a/live-x.test.mjs",
      ),
    );
    assert.deepEqual(coachOnlyFiles(["a/b", "c"], ["a/"]), ["a/b"]);
  });

  test("root scripts that call a removed file go with it", () => {
    const pkg = JSON.parse(
      pruneRootScripts(
        JSON.stringify({
          scripts: { a: "node scripts/live-sync.mjs", b: "turbo run test" },
        }),
        ["scripts/live-sync.mjs"],
      ),
    );
    assert.deepEqual(pkg.scripts, { b: "turbo run test" });
  });
});

describe("the cut", () => {
  let remote;
  beforeEach(() => {
    remote = temp("remote-");
    run(remote, ["init", "-q", "--bare"]);
  });

  test("case-start is main without the coaches' material, with the case's README at the root", () => {
    const repoDir = mainRepo();
    const verified = [];

    const result = cut({
      repoDir,
      epic: "#7",
      demoIssue: "#8",
      terms: TERMS,
      refreshLockfile: noLockfile,
      verify: (dir) => verified.push(run(dir, ["branch", "--show-current"])),
      log: quiet,
    });
    pushCut({ dir: result.dir, remote });

    const files = run(remote, [
      "ls-tree",
      "-r",
      "--name-only",
      CASE_START,
    ]).split("\n");
    for (const gone of [
      ".scratch/workshop/map.md",
      "apps/deck/slides.md",
      "scripts/live-sync.mjs",
      "scripts/test/live-sync.test.mjs",
      "scripts/coach-only.txt",
      "case/README.md",
    ])
      assert.ok(!files.includes(gone), gone);
    assert.ok(files.includes("scripts/setup-check.mjs"));
    assert.match(run(remote, ["show", `${CASE_START}:README.md`]), /# Forkful/);
    assert.deepEqual(
      JSON.parse(run(remote, ["show", `${CASE_START}:package.json`])).scripts,
      {
        test: "turbo run test",
        "setup:check": "node scripts/setup-check.mjs",
      },
    );
    assert.deepEqual(
      verified,
      BASES.map((b) => b.baseBranch),
    );
  });

  test("each base differs from case-start only in its docs/agents/ values; the demo also has say-it-back", () => {
    const result = cut({
      repoDir: mainRepo(),
      epic: "#7",
      demoIssue: "#8",
      terms: TERMS,
      refreshLockfile: noLockfile,
      verify: null,
      log: quiet,
    });
    pushCut({ dir: result.dir, remote });

    for (const base of BASES) {
      const changed = run(remote, [
        "diff",
        "--name-only",
        CASE_START,
        base.baseBranch,
      ]).split("\n");
      const keys = parseWorkshopKeys(
        run(remote, ["show", `${base.baseBranch}:docs/agents/workshop.md`]),
      );
      assert.deepEqual(keys, {
        group: base.group,
        baseBranch: base.baseBranch,
        workBranch: base.workBranch,
        workingOut: base.workingOut,
        epic: base.group === "demo" ? "#8" : "#7",
      });
      if (base.group === "demo") {
        assert.deepEqual(changed, [
          ".agents/skills/say-it-back/SKILL.md",
          "docs/agents/workshop.md",
        ]);
        assert.equal(
          run(remote, [
            "show",
            `${base.baseBranch}:.agents/skills/say-it-back/SKILL.md`,
          ]),
          SAY_IT_BACK.trim(),
        );
      } else assert.deepEqual(changed, ["docs/agents/workshop.md"]);
    }
  });

  test("a planted term outside the case's source stops the cut, before anything is pushed", () => {
    const repoDir = mainRepo({ "docs/hint.md": "Look at the Zorblax.\n" });

    assert.throws(
      () =>
        cut({
          repoDir,
          epic: "#7",
          demoIssue: "#8",
          terms: TERMS,
          refreshLockfile: noLockfile,
          verify: null,
          log: quiet,
        }),
      /group-a\/main: planted term in docs\/hint\.md:1/,
    );
  });

  test("a missing harness file or a failing install stops the cut", () => {
    const repoDir = mainRepo({ ".github/workflows/reporter.yml": null });

    assert.throws(
      () =>
        cut({
          repoDir,
          epic: "#7",
          demoIssue: "#8",
          terms: TERMS,
          refreshLockfile: noLockfile,
          verify: null,
          log: quiet,
        }),
      /missing \.github\/workflows\/reporter\.yml/,
    );
    assert.throws(
      () =>
        cut({
          repoDir: mainRepo(),
          epic: "#7",
          demoIssue: "#8",
          terms: TERMS,
          refreshLockfile: noLockfile,
          verify: () => {
            throw new Error("ERR_PNPM_OUTDATED_LOCKFILE");
          },
          log: quiet,
        }),
      /install or tests failed: ERR_PNPM_OUTDATED_LOCKFILE/,
    );
  });

  test("refuses to overwrite bases a remote already has, unless forced", () => {
    const options = {
      epic: "#7",
      demoIssue: "#8",
      terms: TERMS,
      refreshLockfile: noLockfile,
      verify: null,
      log: quiet,
    };
    pushCut({ dir: cut({ repoDir: mainRepo(), ...options }).dir, remote });
    const again = cut({ repoDir: mainRepo(), ...options });

    assert.throws(
      () => pushCut({ dir: again.dir, remote }),
      /already has .*refs\/heads\/group-a\/main.*pass --force/,
    );
    pushCut({ dir: again.dir, remote, force: true });
    assert.equal(
      run(remote, ["rev-parse", "group-a/main"]),
      again.bases["group-a/main"],
    );
  });
});

describe("the hotfix", () => {
  let remote;
  let repoDir;
  beforeEach(() => {
    remote = temp("remote-");
    run(remote, ["init", "-q", "--bare"]);
    repoDir = mainRepo();
    const result = cut({
      repoDir,
      epic: "#7",
      demoIssue: "#8",
      terms: TERMS,
      refreshLockfile: noLockfile,
      verify: null,
      log: quiet,
    });
    pushCut({ dir: result.dir, remote });
  });

  test("cherry-picks a reporter fix onto every base", () => {
    const fix = commit(
      repoDir,
      { "scripts/reporter-input.mjs": "// fixed\n" },
      { at: T, message: "Fix the reporter" },
    );

    hotfix({ repoDir, commit: fix, remote, terms: TERMS, log: quiet });

    for (const base of BASES) {
      assert.equal(
        run(remote, ["show", `${base.baseBranch}:scripts/reporter-input.mjs`]),
        "// fixed",
      );
      assert.match(
        run(remote, ["log", "-1", "--format=%B", base.baseBranch]),
        /cherry picked from commit/,
      );
    }
  });

  test("refuses anything but coach-owned paths, and coach-only files", () => {
    const touchesCase = commit(
      repoDir,
      { "case/api/Program.cs": "// changed\n" },
      { at: T, message: "case" },
    );
    assert.throws(
      () =>
        hotfix({
          repoDir,
          commit: touchesCase,
          remote,
          terms: TERMS,
          log: quiet,
        }),
      /case\/api\/Program\.cs isn't coach-owned/,
    );

    const coachOnly = commit(
      repoDir,
      { "scripts/live-sync.mjs": "// changed\n" },
      { at: T, message: "sync" },
    );
    assert.throws(
      () =>
        hotfix({
          repoDir,
          commit: coachOnly,
          remote,
          terms: TERMS,
          log: quiet,
        }),
      /scripts\/live-sync\.mjs is coach-only/,
    );
  });

  test("a dry run applies everywhere and pushes nothing", () => {
    const before = run(remote, ["rev-parse", "group-a/main"]);
    const fix = commit(
      repoDir,
      { ".github/workflows/reporter.yml": "# fixed\n" },
      { at: T, message: "Fix" },
    );

    const result = hotfix({
      repoDir,
      commit: fix,
      remote,
      terms: TERMS,
      push: false,
      log: quiet,
    });

    assert.equal(Object.keys(result.bases).length, BASES.length);
    assert.equal(run(remote, ["rev-parse", "group-a/main"]), before);
  });
});
