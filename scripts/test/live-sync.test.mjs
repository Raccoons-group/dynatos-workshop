import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, test } from "node:test";
import { fileURLToPath } from "node:url";

import { syncOnce } from "../live-sync.mjs";
import { DATA_BRANCH, initDataBranch, publish } from "../publish-live-data.mjs";
import { commit, initRepo, run, tempDir } from "./helpers/repo.mjs";

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "observations",
);
const fixture = (name) =>
  JSON.parse(fs.readFileSync(path.join(fixtures, `${name}.json`), "utf8"));
const dirs = [];
const temp = (prefix) => {
  const dir = tempDir(prefix);
  dirs.push(dir);
  return dir;
};

let remote;
let laptop;
let liveDir;
const prs = [
  {
    number: 12,
    title: "Group orders",
    state: "OPEN",
    isDraft: true,
    headRefName: "group-a/group-orders",
    baseRefName: "group-a/main",
    updatedAt: "2026-10-27T13:41:00Z",
  },
];
const gh = () => JSON.stringify(prs);
const now = () => new Date("2026-10-27T13:45:00Z");

function publishFrom(name, { push = true, dataDir } = {}) {
  const dir = dataDir ?? temp("publisher-");
  if (!dataDir) run(dir, ["clone", "-q", "-b", DATA_BRANCH, remote, "."]);
  const o = fixture(name);
  return publish({
    dataDir: dir,
    push,
    group: o.group,
    pr: o.pr,
    sha: o.sha,
    facts: o.facts,
    judgements: o.judgements,
    reportedAt: o.reportedAt,
  });
}

beforeEach(() => {
  remote = temp("remote-");
  run(remote, ["init", "-q", "--bare", "-b", "main"]);
  laptop = temp("laptop-");
  initRepo(laptop);
  commit(
    laptop,
    { "README.md": "# Workshop\n" },
    { at: "2026-10-27T08:00:00+01:00" },
  );
  run(laptop, ["remote", "add", "origin", remote]);
  run(laptop, ["push", "-q", "origin", "main"]);
  initDataBranch({ repoDir: laptop });
  liveDir = path.join(laptop, ".live");
});

after(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
});

test("the first sync checks out the data branch and writes the meta", () => {
  const meta = syncOnce({ repoDir: laptop, liveDir, gh, now });

  assert.ok(fs.existsSync(path.join(liveDir, "data", "README.md")));
  assert.deepEqual(meta, {
    lastFetchAt: "2026-10-27T13:45:00.000Z",
    lastFetchError: null,
    prs,
  });
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(liveDir, "meta.json"), "utf8")),
    meta,
  );
});

test("a later sync brings in what CI published", () => {
  syncOnce({ repoDir: laptop, liveDir, gh, now });
  publishFrom("group-a");

  syncOnce({ repoDir: laptop, liveDir, gh, now });

  assert.equal(
    JSON.parse(
      fs.readFileSync(
        path.join(liveDir, "data", "groups", "group-a.json"),
        "utf8",
      ),
    ).group,
    "group-a",
  );
});

test("an observation published locally while offline survives the next sync", () => {
  syncOnce({ repoDir: laptop, liveDir, gh, now });
  publishFrom("group-b", { push: false, dataDir: path.join(liveDir, "data") });
  publishFrom("group-a");

  const meta = syncOnce({ repoDir: laptop, liveDir, gh, now });

  assert.equal(meta.lastFetchError, null);
  assert.ok(
    fs.existsSync(path.join(liveDir, "data", "groups", "group-a.json")),
  );
  assert.ok(
    fs.existsSync(path.join(liveDir, "data", "groups", "group-b.json")),
  );
  assert.equal(
    run(path.join(liveDir, "data"), [
      "rev-list",
      "--count",
      `origin/${DATA_BRANCH}..HEAD`,
    ]),
    "1",
    "still waiting to be pushed",
  );
});

test("offline: keeps the data and the last fetch time, and says why", () => {
  syncOnce({ repoDir: laptop, liveDir, gh, now });
  run(laptop, ["remote", "set-url", "origin", path.join(remote, "gone")]);
  const failingGh = () => {
    throw new Error("no network");
  };

  const meta = syncOnce({
    repoDir: laptop,
    liveDir,
    gh: failingGh,
    now: () => new Date("2026-10-27T14:00:00Z"),
  });

  assert.equal(meta.lastFetchAt, "2026-10-27T13:45:00.000Z");
  assert.ok(meta.lastFetchError);
  assert.deepEqual(meta.prs, prs, "the last PR list stays");
  assert.ok(fs.existsSync(path.join(liveDir, "data", "README.md")));
});
