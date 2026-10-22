// The demo reset against a bare remote, with GitHub's side recorded. Coach-only: the cut removes it.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, test } from "node:test";

import { DEMO_BRANCH, LABEL, demoReset } from "../demo-reset.mjs";
import { commit, initRepo, run, tempDir } from "./helpers/repo.mjs";

const T = "2026-10-27T10:00:00+01:00";
const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};
after(() =>
  dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

// A recorded `gh`: one open PR at most, whose state the calls change.
function fakeGh(initial = null) {
  const calls = [];
  let pr = initial;
  const gh = (args) => {
    calls.push(
      args.slice(0, 2).join(" ") +
        (args.includes("--undo") ? " --undo" : "") +
        (args.includes("--add-label") ? " +label" : "") +
        (args.includes("--remove-label") ? " -label" : ""),
    );
    if (args[1] === "list") return JSON.stringify(pr ? [pr] : []);
    if (args[1] === "create") {
      pr = {
        number: 21,
        isDraft: true,
        labels: [],
        body: args[args.indexOf("--body") + 1],
      };
      return "https://github.com/o/r/pull/21\n";
    }
    if (args[1] === "ready") pr.isDraft = args.includes("--undo");
    if (args[1] === "edit")
      pr.labels = args.includes("--add-label") ? [{ name: LABEL }] : [];
    return "";
  };
  return { gh, calls, pr: () => pr };
}

let remote;
let laptop;
let tags;
beforeEach(() => {
  remote = temp("remote-");
  run(remote, ["init", "-q", "--bare"]);
  const author = temp("author-");
  initRepo(author, "demo/main");
  commit(
    author,
    {
      "docs/agents/workshop.md":
        "Group: demo\nBase branch: demo/main\nEpic: #8\n",
    },
    { at: T, message: "cut" },
  );
  run(author, ["switch", "-q", "-c", DEMO_BRANCH]);
  tags = {};
  for (const [tag, file] of [
    ["demo/01-read", "read.md"],
    ["demo/03-specified", "spec.md"],
    ["demo/07-shipped", "pr.md"],
  ]) {
    commit(
      author,
      { [`work/demo/${file}`]: `${tag}\n` },
      { at: T, message: tag },
    );
    run(author, ["tag", tag]);
    tags[tag] = run(author, ["rev-parse", "HEAD"]);
  }
  run(author, ["remote", "add", "origin", remote]);
  run(author, ["push", "-q", "origin", "demo/main", DEMO_BRANCH, "--tags"]);

  laptop = temp("laptop-");
  run(laptop, ["clone", "-q", "-b", "demo/main", remote, "."]);
});

test("a PR tag opens the PR as a draft with the label, and the branch follows the tag", () => {
  const github = fakeGh();

  const result = demoReset({
    repoDir: laptop,
    tag: "demo/03-specified",
    repo: "o/r",
    gh: github.gh,
    log: () => {},
  });

  assert.equal(
    run(remote, ["rev-parse", DEMO_BRANCH]),
    tags["demo/03-specified"],
  );
  assert.equal(result.pr, 21);
  assert.deepEqual(github.pr(), {
    number: 21,
    isDraft: true,
    labels: [{ name: LABEL }],
    body: "Part of #8",
  });
});

test("going forward to a shipped tag marks the PR ready; going back makes it a draft again", () => {
  const github = fakeGh({
    number: 21,
    isDraft: true,
    labels: [{ name: LABEL }],
  });

  demoReset({
    repoDir: laptop,
    tag: "demo/07-shipped",
    repo: "o/r",
    gh: github.gh,
    log: () => {},
  });
  assert.equal(github.pr().isDraft, false);

  demoReset({
    repoDir: laptop,
    tag: "demo/03-specified",
    repo: "o/r",
    gh: github.gh,
    log: () => {},
  });
  assert.equal(github.pr().isDraft, true);
  assert.equal(
    run(remote, ["rev-parse", DEMO_BRANCH]),
    tags["demo/03-specified"],
  );
  assert.ok(!github.calls.some((call) => call.includes("close")));
});

test("a tag from before the PR never closes it: back to a draft, without the label", () => {
  const github = fakeGh({
    number: 21,
    isDraft: false,
    labels: [{ name: LABEL }],
  });

  demoReset({
    repoDir: laptop,
    tag: "demo/01-read",
    repo: "o/r",
    gh: github.gh,
    log: () => {},
  });

  assert.deepEqual(github.pr(), { number: 21, isDraft: true, labels: [] });
  assert.equal(run(remote, ["rev-parse", DEMO_BRANCH]), tags["demo/01-read"]);
});

test("without a PR, an early tag only moves the branch", () => {
  const github = fakeGh();

  demoReset({
    repoDir: laptop,
    tag: "demo/01-read",
    repo: "o/r",
    gh: github.gh,
    log: () => {},
  });

  assert.equal(github.pr(), null);
  assert.deepEqual(github.calls, ["pr list"]);
});

test("the demo checkout on this laptop is reset with it", () => {
  const worktree = path.join(temp("wt-"), "demo");
  run(laptop, [
    "worktree",
    "add",
    "-q",
    "-b",
    DEMO_BRANCH,
    worktree,
    tags["demo/07-shipped"],
  ]);
  fs.writeFileSync(path.join(worktree, "work/demo/pr.md"), "edited live\n");

  demoReset({
    repoDir: laptop,
    tag: "demo/03-specified",
    repo: "o/r",
    gh: fakeGh().gh,
    log: () => {},
  });

  assert.equal(run(worktree, ["rev-parse", "HEAD"]), tags["demo/03-specified"]);
  assert.ok(!fs.existsSync(path.join(worktree, "work/demo/pr.md")));
});

test("an unknown tag is refused before anything moves", () => {
  assert.throws(
    () =>
      demoReset({
        repoDir: laptop,
        tag: "demo/99-nope",
        repo: "o/r",
        gh: fakeGh().gh,
        log: () => {},
      }),
    /isn't a fallback tag/,
  );
});
