import assert from "node:assert/strict";
import { test } from "node:test";

import {
  groupOfBranch,
  parseWorkshopKeys,
  targetMismatch,
} from "../lib/workshop-keys.mjs";

const groupBase = `# This branch in the workshop

Group: group-a
Base branch: group-a/main
Work branch: group-a/group-orders
Working-out: work/group-a
Epic: #7
`;

test("reads a group base's keys", () => {
  assert.deepEqual(parseWorkshopKeys(groupBase), {
    group: "group-a",
    baseBranch: "group-a/main",
    workBranch: "group-a/group-orders",
    workingOut: "work/group-a/",
    epic: "#7",
  });
});

// main's placeholders. Not read from the repo's own file: the cut writes real keys into it on every base.
const main = `# This branch in the workshop

Group: none
Base branch: main
Work branch: none
Working-out: none
Epic: none
`;

test("reads main's placeholders as no group", () => {
  const keys = parseWorkshopKeys(main);

  assert.equal(keys.group, null);
  assert.equal(keys.workingOut, null);
  assert.equal(keys.baseBranch, "main");
});

test("takes the group from a work branch", () => {
  assert.equal(groupOfBranch("group-b/group-orders"), "group-b");
  assert.equal(groupOfBranch("refs/heads/demo/allergens"), "demo");
  assert.equal(groupOfBranch("main"), null);
});

test("accepts a PR into its own group's base", () => {
  assert.equal(
    targetMismatch({
      keys: parseWorkshopKeys(groupBase),
      headRef: "group-a/group-orders",
    }),
    null,
  );
});

test("asks to retarget a PR into another group's base or into main", () => {
  assert.match(
    targetMismatch({
      keys: parseWorkshopKeys(groupBase),
      headRef: "group-b/group-orders",
    }),
    /Retarget it to group-b\/main/,
  );
  assert.match(
    targetMismatch({
      keys: parseWorkshopKeys("Group: none\n"),
      headRef: "group-c/group-orders",
    }),
    /Retarget it to group-c\/main/,
  );
});
