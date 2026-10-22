#!/usr/bin/env node
// Which group a PR reports for, decided from the base branch's own docs/agents/workshop.md, so a PR can't
// claim another group's card. The reporter workflow runs this before anything else.
//
//   skip   a PR into main (Day 2's lab and plan PRs never become wall cards)
//   error  the head branch belongs to another group, or the base to none: "Retarget it to group-x/main."
//   group  the group whose card the PR updates
//
// Usage: node scripts/reporter-target.mjs --base-ref <branch> --head-ref <branch> [--keys docs/agents/workshop.md]
// Writes `skip=` and `group=` lines to $GITHUB_OUTPUT when it's set, and exits 1 on an error.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { parseWorkshopKeys, targetMismatch } from "./lib/workshop-keys.mjs";

export function reporterTarget({ keysText, baseRef, headRef }) {
  if (baseRef === "main")
    return {
      skip: "PRs into main are Day 2 lab and plan PRs, not group cards.",
    };
  const keys = parseWorkshopKeys(keysText);
  const mismatch = targetMismatch({ keys, headRef });
  if (mismatch) return { error: mismatch };
  if (keys.baseBranch !== baseRef)
    return {
      error: `docs/agents/workshop.md on ${baseRef} says its base is ${keys.baseBranch}. Ask a coach to re-cut it.`,
    };
  return { group: keys.group };
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      "base-ref": { type: "string" },
      "head-ref": { type: "string" },
      keys: { type: "string", default: "docs/agents/workshop.md" },
    },
  });
  const target = reporterTarget({
    keysText: fs.existsSync(values.keys)
      ? fs.readFileSync(values.keys, "utf8")
      : "",
    baseRef: values["base-ref"] ?? "",
    headRef: values["head-ref"] ?? "",
  });
  if (target.error) {
    console.error(target.error);
    process.exit(1);
  }
  const lines = target.skip
    ? ["skip=true", "group="]
    : ["skip=false", `group=${target.group}`];
  console.log(target.skip ?? `Reporting for ${target.group}.`);
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
}
