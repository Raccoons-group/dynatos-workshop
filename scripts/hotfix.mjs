#!/usr/bin/env node
// The reporter hotfix (coach-only). The reporter is frozen into each base at the cut. When it needs a fix on
// Day 1, make one commit on `main` that touches only coach-owned paths, and this cherry-picks it onto every
// base. The workflow loads from the base, so each group's next push picks it up.
//
// It refuses a commit that touches anything else (a group's base must stay as the group left it) or a
// coach-only file the bases don't carry. It works in a throwaway clone, and only fast-forwards the bases.
//
// Usage: node scripts/hotfix.mjs --commit <sha> [--remote origin] [--dry-run]
//          [--terms .scratch/workshop/coach/leak-terms.txt]

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { BASES, MANIFEST, coachOnlyFiles, readManifest } from "./cut.mjs";
import { git, gitOk } from "./lib/git.mjs";
import { DEFAULT_TERMS, leakCheck, readTerms } from "./leak-check.mjs";

// What a coach may change on a base during the day.
export const COACH_OWNED = [".claude/skills/reporter/", ".github/", "scripts/"];

export function hotfixProblems({ files, manifest }) {
  const problems = files
    .filter((file) => !COACH_OWNED.some((prefix) => file.startsWith(prefix)))
    .map((file) => `${file} isn't coach-owned (${COACH_OWNED.join(", ")})`);
  for (const file of coachOnlyFiles(files, manifest))
    problems.push(`${file} is coach-only: the bases don't carry it`);
  return problems;
}

export function hotfix({
  repoDir,
  commit,
  remote,
  terms,
  push = true,
  log = console.log,
}) {
  const files = git(repoDir, [
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    commit,
  ])
    .split("\n")
    .filter(Boolean);
  const manifest = readManifest(
    fs.readFileSync(path.join(repoDir, MANIFEST), "utf8"),
  );
  const problems = hotfixProblems({ files, manifest });
  if (problems.length)
    throw new Error(
      `Not a hotfix commit:\n${problems.map((p) => `  ${p}`).join("\n")}`,
    );

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "workshop-hotfix-"));
  git(dir, ["clone", "-q", "--no-hardlinks", repoDir, "."]);
  const refs = BASES.map(
    (b) => `+refs/heads/${b.baseBranch}:refs/heads/${b.baseBranch}`,
  );
  git(dir, ["fetch", "-q", remote, ...refs]);
  const who = [
    "-c",
    `user.name=${git(repoDir, ["log", "-1", "--format=%an", commit])}`,
    "-c",
    `user.email=${git(repoDir, ["log", "-1", "--format=%ae", commit])}`,
  ];

  const result = {};
  for (const { baseBranch } of BASES) {
    git(dir, ["switch", "-q", baseBranch]);
    if (!gitOk(dir, [...who, "cherry-pick", "-x", commit])) {
      gitOk(dir, ["cherry-pick", "--abort"]);
      throw new Error(
        `${commit.slice(0, 7)} doesn't apply cleanly to ${baseBranch}; nothing was pushed.`,
      );
    }
    const hits = leakCheck({ dir, terms });
    if (hits.length)
      throw new Error(
        `${baseBranch} would carry a planted term (${hits[0].file}:${hits[0].line}); nothing was pushed.`,
      );
    result[baseBranch] = git(dir, ["rev-parse", "HEAD"]);
    log(`${baseBranch}: ${result[baseBranch].slice(0, 7)}`);
  }
  if (push)
    git(dir, [
      "push",
      "-q",
      remote,
      ...BASES.map(
        (b) => `refs/heads/${b.baseBranch}:refs/heads/${b.baseBranch}`,
      ),
    ]);
  return { dir, bases: result };
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      commit: { type: "string" },
      remote: { type: "string", default: "origin" },
      terms: { type: "string", default: DEFAULT_TERMS },
      "dry-run": { type: "boolean", default: false },
    },
  });
  if (!values.commit) {
    console.error(
      "Usage: hotfix.mjs --commit <sha> [--remote origin] [--dry-run]",
    );
    process.exit(2);
  }
  const repoDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const remote = gitOk(repoDir, ["remote", "get-url", values.remote])
    ? git(repoDir, ["remote", "get-url", values.remote])
    : values.remote;
  try {
    hotfix({
      repoDir,
      commit: git(repoDir, ["rev-parse", values.commit]),
      remote,
      terms: readTerms(path.resolve(repoDir, values.terms)),
      push: !values["dry-run"],
    });
    console.log(
      values["dry-run"]
        ? "Dry run: applied to every base, nothing pushed."
        : "Pushed to every base.",
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
