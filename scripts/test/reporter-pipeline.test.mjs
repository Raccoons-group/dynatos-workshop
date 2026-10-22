import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { reporterTarget } from "../reporter-target.mjs";
import { waitForCheck } from "../wait-for-check.mjs";

const T = (time) => `2026-10-27T${time}:00+01:00`;
const keys = (group, base) =>
  `Group: ${group}\nBase branch: ${base}\nWork branch: ${group === "none" ? "none" : `${group}/group-orders`}\nWorking-out: ${group === "none" ? "none" : `work/${group}/`}\nEpic: none\n`;
describe("which group's card a PR updates", () => {
  test("a group's PR into its own base reports for that group", () => {
    assert.deepEqual(
      reporterTarget({
        keysText: keys("group-a", "group-a/main"),
        baseRef: "group-a/main",
        headRef: "group-a/group-orders",
      }),
      { group: "group-a" },
    );
  });

  test("a PR into main is skipped", () => {
    assert.ok(
      reporterTarget({
        keysText: keys("none", "main"),
        baseRef: "main",
        headRef: "lab/a-skill",
      }).skip,
    );
  });

  test("a PR into another group's base fails with how to retarget it", () => {
    assert.match(
      reporterTarget({
        keysText: keys("group-a", "group-a/main"),
        baseRef: "group-a/main",
        headRef: "group-b/group-orders",
      }).error,
      /Retarget it to group-b\/main\./,
    );
  });

  test("a base whose keys name another base fails", () => {
    assert.match(
      reporterTarget({
        keysText: keys("group-a", "group-a/main"),
        baseRef: "group-a/old",
        headRef: "group-a/group-orders",
      }).error,
      /re-cut/,
    );
  });
});

describe("waiting for the tests", () => {
  const clock = () => {
    let t = 0;
    return { now: () => t, sleep: async (ms) => (t += ms) };
  };

  test("waits until every run of the check has finished, then reports the latest", async () => {
    const answers = [
      [],
      [
        {
          name: "test",
          status: "in_progress",
          conclusion: null,
          completedAt: null,
        },
      ],
      [
        {
          name: "test",
          status: "completed",
          conclusion: "failure",
          completedAt: T("10:01"),
        },
        {
          name: "test",
          status: "completed",
          conclusion: "success",
          completedAt: T("10:05"),
        },
        { name: "lint", status: "queued", conclusion: null, completedAt: null },
      ],
    ];
    const github = { checkRuns: async () => answers.shift() ?? [] };

    const result = await waitForCheck({ github, sha: "abc", ...clock() });

    assert.deepEqual(result, { done: true, conclusion: "success" });
    assert.equal(answers.length, 0);
  });

  test("gives up after the timeout, so a card without CI still lands", async () => {
    const github = { checkRuns: async () => [] };

    const result = await waitForCheck({
      github,
      sha: "abc",
      timeoutMs: 60_000,
      intervalMs: 15_000,
      ...clock(),
    });

    assert.deepEqual(result, { done: false, conclusion: null });
  });
});
