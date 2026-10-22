import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, test } from "node:test";
import { fileURLToPath } from "node:url";

import { DATA_BRANCH, initDataBranch, publish } from "../publish-live-data.mjs";
import { initRepo, commit, run, tempDir } from "./helpers/repo.mjs";

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "observations",
);
const fixture = (name) =>
  JSON.parse(fs.readFileSync(path.join(fixtures, name), "utf8"));
const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};

let remote;
let repo;

beforeEach(() => {
  remote = temp("remote-");
  run(remote, ["init", "-q", "--bare", "-b", "main"]);
  repo = temp("repo-");
  initRepo(repo);
  commit(
    repo,
    { "README.md": "# Workshop\n" },
    { at: "2026-10-27T08:00:00+01:00" },
  );
  run(repo, ["remote", "add", "origin", remote]);
  run(repo, ["push", "-q", "origin", "main"]);
});

after(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
});

function checkoutData() {
  const dir = temp("data-");
  run(dir, ["clone", "-q", "-b", DATA_BRANCH, remote, "."]);
  return dir;
}

function input(name, overrides = {}) {
  const observation = fixture(name);
  return {
    group: observation.group,
    pr: observation.pr,
    sha: observation.sha,
    facts: observation.facts,
    judgements: observation.judgements,
    reportedAt: observation.reportedAt,
    ...overrides,
  };
}

const remoteFile = (file) => run(remote, ["show", `${DATA_BRANCH}:${file}`]);

test("creates the orphan data branch once", () => {
  assert.deepEqual(initDataBranch({ repoDir: repo }), { created: true });
  assert.deepEqual(initDataBranch({ repoDir: repo }), { created: false });

  assert.match(remoteFile("README.md"), /live-deck-data/);
  assert.equal(
    run(remote, ["log", "--format=%P", "-1", DATA_BRANCH]),
    "",
    "the branch has no parent: it's an orphan",
  );
});

test("writes the latest observation and a history snapshot, then pushes", () => {
  initDataBranch({ repoDir: repo });
  const data = checkoutData();

  const result = publish({ dataDir: data, ...input("group-a.json") });

  assert.equal(result.pushed, true);
  assert.deepEqual(result.files, [
    "groups/group-a.json",
    "history/group-a/20261027T134210Z-12.json",
  ]);
  assert.equal(
    JSON.parse(remoteFile("groups/group-a.json")).facts.phase,
    "Spec reviewed",
  );
  assert.equal(
    JSON.parse(remoteFile("history/group-a/20261027T134210Z-12.json")).pr,
    12,
  );
});

test("two publishers racing both land, through a rebase", () => {
  initDataBranch({ repoDir: repo });
  const first = checkoutData();
  const second = checkoutData();

  publish({ dataDir: first, ...input("group-a.json") });
  const late = publish({ dataDir: second, ...input("group-b.json") });

  assert.equal(
    late.attempts,
    2,
    "the second push was rejected once, rebased, then pushed",
  );
  assert.equal(JSON.parse(remoteFile("groups/group-a.json")).group, "group-a");
  assert.equal(JSON.parse(remoteFile("groups/group-b.json")).group, "group-b");
});

test("an observation that breaks the schema is never written", () => {
  initDataBranch({ repoDir: repo });
  const data = checkoutData();
  const broken = input("group-a.json");
  broken.judgements = { ...broken.judgements, decisions: {} };

  assert.throws(
    () => publish({ dataDir: data, ...broken }),
    /doesn't match the schema[\s\S]*\/judgements\/decisions\/join: is required/,
  );
  assert.equal(fs.existsSync(path.join(data, "groups", "group-a.json")), false);
});

test("caps a too-long string instead of failing", () => {
  initDataBranch({ repoDir: repo });
  const data = checkoutData();
  const chatty = input("group-c.json");
  chatty.judgements = { ...chatty.judgements, notable: "n".repeat(400) };

  const { observation } = publish({ dataDir: data, ...chatty });

  assert.equal([...observation.judgements.notable].length, 140);
  assert.equal(
    JSON.parse(remoteFile("groups/group-c.json")).judgements.notable.length,
    140,
  );
});

test("works without pushing, for the offline fallback", () => {
  initDataBranch({ repoDir: repo });
  const data = checkoutData();

  const result = publish({
    dataDir: data,
    push: false,
    ...input("group-late.json"),
  });

  assert.deepEqual([result.committed, result.pushed], [true, false]);
  assert.ok(fs.existsSync(path.join(data, "groups", "group-late.json")));
  assert.throws(() => remoteFile("groups/group-late.json"));
});
