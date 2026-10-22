// The reporter's local fallback, against a bare remote. Coach-only: the cut removes it with the script.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, beforeEach, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import { recordedGitHub } from "../lib/github.mjs";
import {
  DATA_BRANCH,
  buildObservation,
  initDataBranch,
} from "../publish-live-data.mjs";
import { agentSchema, reportLocal } from "../report-local.mjs";
import { commit, initRepo, run, tempDir } from "./helpers/repo.mjs";

const T = (time) => `2026-10-27T${time}:00+01:00`;
const keys = (group, base) =>
  `Group: ${group}\nBase branch: ${base}\nWork branch: ${group === "none" ? "none" : `${group}/group-orders`}\nWorking-out: ${group === "none" ? "none" : `work/${group}/`}\nEpic: none\n`;
const fixture = (name) =>
  JSON.parse(
    fs.readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "fixtures",
        "observations",
        `${name}.json`,
      ),
      "utf8",
    ),
  );

describe("the local fallback", () => {
  const dirs = [];
  const temp = (prefix) => {
    const dir = tempDir(prefix);
    dirs.push(dir);
    return dir;
  };
  after(() =>
    dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
  );

  let remote;
  let laptop;
  let headSha;
  const judgements = fixture("group-a").judgements;
  const agent = async () => ({ judgements, cost: 0.12, turns: 6 });
  const noGh = () => "[]";

  beforeEach(() => {
    remote = temp("remote-");
    run(remote, ["init", "-q", "--bare", "-b", "main"]);
    const author = temp("author-");
    initRepo(author);
    commit(
      author,
      { "docs/agents/workshop.md": keys("none", "main") },
      { at: T("08:00"), message: "main" },
    );
    run(author, ["remote", "add", "origin", remote]);
    run(author, ["push", "-q", "origin", "main"]);
    run(author, ["switch", "-q", "-c", "group-a/main"]);
    commit(
      author,
      { "docs/agents/workshop.md": keys("group-a", "group-a/main") },
      { at: T("08:30"), message: "cut" },
    );
    run(author, ["push", "-q", "origin", "group-a/main"]);
    run(author, ["switch", "-q", "-c", "group-a/group-orders"]);
    headSha = commit(
      author,
      {
        "work/group-a/spec.md":
          "# Group orders\n\nColleagues join with a code.\n",
      },
      { at: T("11:30"), message: "spec" },
    );
    run(author, ["push", "-q", "origin", "group-a/group-orders"]);
    run(author, ["switch", "-q", "-c", "group-b/group-orders", "group-a/main"]);
    commit(
      author,
      { "work/group-b/spec.md": "# Ours\n" },
      { at: T("11:35"), message: "spec" },
    );
    run(author, ["push", "-q", "origin", "group-b/group-orders"]);
    initDataBranch({ repoDir: author });

    laptop = temp("laptop-");
    run(laptop, ["clone", "-q", remote, "."]);
  });

  const github = recordedGitHub({
    pullRequests: {
      12: {
        draft: true,
        headRef: "group-a/group-orders",
        baseRef: "group-a/main",
        headSha: "",
      },
      13: {
        draft: true,
        headRef: "group-b/group-orders",
        baseRef: "group-a/main",
        headSha: "",
      },
      14: {
        draft: false,
        headRef: "group-a/group-orders",
        baseRef: "main",
        headSha: "",
      },
    },
  });

  test("writes the same observation the workflow would, and pushes it to the data branch", async () => {
    const result = await reportLocal({
      repoDir: laptop,
      pr: 12,
      github,
      runAgent: agent,
      gh: noGh,
    });

    assert.equal(result.pushed, true);
    const written = JSON.parse(
      fs.readFileSync(
        path.join(laptop, ".live", "data", "groups", "group-a.json"),
        "utf8",
      ),
    );
    const facts = JSON.parse(
      fs.readFileSync(
        path.join(laptop, ".reporter-input", "facts.json"),
        "utf8",
      ),
    );
    assert.deepEqual(
      written,
      buildObservation({
        group: "group-a",
        pr: 12,
        sha: headSha,
        facts,
        judgements,
        reportedAt: written.reportedAt,
      }),
    );
    assert.equal(facts.phase, "Specifying");
    assert.match(run(remote, ["log", "--oneline", DATA_BRANCH]), /group-a #12/);
  });

  test("offline, the card still lands in .live/data and waits to be pushed", async () => {
    const liveDir = path.join(laptop, ".live");
    await reportLocal({
      repoDir: laptop,
      pr: 12,
      github,
      runAgent: agent,
      gh: noGh,
      push: false,
    });
    run(laptop, [
      "remote",
      "set-url",
      "--push",
      "origin",
      path.join(remote, "gone"),
    ]);

    const result = await reportLocal({
      repoDir: laptop,
      pr: 12,
      github,
      runAgent: agent,
      gh: noGh,
      liveDir,
    });

    assert.equal(result.pushed, false);
    assert.equal(result.committed, true);
    assert.ok(
      fs.existsSync(path.join(liveDir, "data", "groups", "group-a.json")),
    );
  });

  test("skips a PR into main, and refuses a PR into another group's base", async () => {
    assert.ok(
      (
        await reportLocal({
          repoDir: laptop,
          pr: 14,
          github,
          runAgent: agent,
          gh: noGh,
        })
      ).skipped,
    );
    await assert.rejects(
      reportLocal({
        repoDir: laptop,
        pr: 13,
        github,
        runAgent: agent,
        gh: noGh,
      }),
      /Retarget it to group-b\/main\./,
    );
  });

  test("the agent gets the judgements schema, without the keys a validator may not know", () => {
    const schema = agentSchema();
    assert.equal(schema.$schema, undefined);
    assert.equal(schema.$id, undefined);
    assert.ok(schema.properties.decisions);
    // claude_args passes the schema inside single quotes.
    assert.ok(!JSON.stringify(schema).includes("'"));
  });
});
