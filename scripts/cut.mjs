#!/usr/bin/env node
// The cut (coach-only). From committed `main` it builds `case-start`: the case without the coaches' material
// (everything in scripts/coach-only.txt), with the case's README as the root README and a refreshed lockfile.
// Then it cuts the four bases from that tag. Each differs from `case-start` only in its docs/agents/ values,
// and demo/main also carries the demo's say-it-back skill. Every base is checked before anything is pushed.
//
// It works in a throwaway clone, so your checkout is never touched. It refuses to overwrite a remote that
// already has the tag or a base: once groups have started, a re-cut would throw their work away.
//
// Usage: node scripts/cut.mjs --epic <n> --demo-issue <n> [--from main] [--remote origin] [--dry-run] [--force]
//          [--fast] [--terms .scratch/workshop/coach/leak-terms.txt]
//   --dry-run  push to a fresh local bare repo instead, and print where it is
//   --fast     install and run the tests on case-start only, not on every base

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { parseWorkshopKeys, setWorkshopKeys } from "./lib/workshop-keys.mjs";
import { DEFAULT_TERMS, leakCheck, readTerms } from "./leak-check.mjs";

export const CASE_START = "case-start";
export const MANIFEST = "scripts/coach-only.txt";

export const BASES = [
  ...["group-a", "group-b", "group-c"].map((group) => ({
    group,
    baseBranch: `${group}/main`,
    workBranch: `${group}/group-orders`,
    workingOut: `work/${group}/`,
  })),
  {
    group: "demo",
    baseBranch: "demo/main",
    workBranch: "demo/allergens",
    workingOut: "work/demo/",
  },
];

// What every base needs for the day to work: the harness, the reporter and its workflows, the PR template.
export const REQUIRED = [
  "AGENTS.md",
  "REVIEW.md",
  "README.md",
  "docs/agents/workshop.md",
  ".github/pull_request_template.md",
  ".github/workflows/guard.yml",
  ".github/workflows/reporter.yml",
  ".github/workflows/tests.yml",
  ".claude/skills/reporter/SKILL.md",
  ".claude/skills/reporter/judgements.schema.json",
  ".claude/skills/reporter/observation.schema.json",
  "scripts/reporter-input.mjs",
  "scripts/reporter-target.mjs",
  "scripts/wait-for-check.mjs",
  "scripts/publish-live-data.mjs",
];
export const FORBIDDEN = [".scratch", "apps/deck", "CLAUDE.md", MANIFEST];

// The demo's one-sentence skill (slide 21, dissected on 25). It lives on demo/main only.
export const SAY_IT_BACK = `---
name: say-it-back
description: Use when starting on an issue, before planning or changing anything.
---

Before you act on an issue, restate it in your own words in at most five lines (what is asked, what is already decided, what is still open), wait for the user's yes, and save the agreed restatement to the working-out folder as \`read.md\`.
`;

export function readManifest(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean);
}

export function matchesPattern(pattern, file) {
  if (pattern.endsWith("/")) return file.startsWith(pattern);
  const re = new RegExp(
    `^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`,
  );
  return re.test(file);
}

export function coachOnlyFiles(files, patterns) {
  return files.filter((file) => patterns.some((p) => matchesPattern(p, file)));
}

// Root scripts that call a removed file go with it (`live:sync`, `report:local`, …).
export function pruneRootScripts(packageJson, removed) {
  const pkg = JSON.parse(packageJson);
  for (const [name, command] of Object.entries(pkg.scripts ?? {}))
    if (removed.some((file) => command.includes(file)))
      delete pkg.scripts[name];
  return JSON.stringify(pkg, null, 2) + "\n";
}

function run(dir, command, args) {
  execFileSync(command, args, { cwd: dir, stdio: "inherit" });
}

export function pnpmLockfileOnly(dir) {
  run(dir, "pnpm", ["install", "--lockfile-only", "--ignore-scripts"]);
}

// The participant's path: a frozen install (with its postinstall), then every suite.
export function installAndTest(dir) {
  run(dir, "pnpm", ["install", "--frozen-lockfile"]);
  run(dir, "pnpm", ["test"]);
}

function identity(repoDir) {
  const get = (key, fallback) =>
    gitOk(repoDir, ["config", key]) ? git(repoDir, ["config", key]) : fallback;
  return [
    "-c",
    `user.name=${get("user.name", "workshop cut")}`,
    "-c",
    `user.email=${get("user.email", "cut@users.noreply.github.com")}`,
  ];
}

export function checkBase({ dir, base, terms, verify }) {
  const problems = [];
  for (const file of REQUIRED)
    if (!fs.existsSync(path.join(dir, file))) problems.push(`missing ${file}`);
  for (const file of FORBIDDEN)
    if (fs.existsSync(path.join(dir, file)))
      problems.push(`still carries ${file}`);
  const keys = parseWorkshopKeys(
    fs.readFileSync(path.join(dir, "docs/agents/workshop.md"), "utf8"),
  );
  for (const key of ["group", "baseBranch", "workBranch", "workingOut"])
    if (base && keys[key] !== base[key])
      problems.push(`docs/agents/workshop.md has ${key} ${keys[key]}`);
  for (const hit of leakCheck({ dir, terms }))
    problems.push(`planted term in ${hit.file}:${hit.line}`);
  if (!problems.length && verify) {
    try {
      verify(dir);
    } catch (error) {
      problems.push(`install or tests failed: ${error.message.split("\n")[0]}`);
    }
  }
  return problems;
}

export function cut({
  repoDir,
  from = "main",
  epic,
  demoIssue,
  terms,
  fast = false,
  refreshLockfile = pnpmLockfileOnly,
  verify = installAndTest,
  log = console.log,
}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "workshop-cut-"));
  const who = identity(repoDir);
  git(dir, ["clone", "-q", "--no-hardlinks", "--branch", from, repoDir, "."]);
  const fromSha = git(dir, ["rev-parse", "HEAD"]);

  // case-start: main without the coaches' material.
  const files = git(dir, ["ls-files"]).split("\n").filter(Boolean);
  const manifest = path.join(dir, MANIFEST);
  if (!fs.existsSync(manifest))
    throw new Error(`${MANIFEST} is missing on ${from}.`);
  const removed = coachOnlyFiles(
    files,
    readManifest(fs.readFileSync(manifest, "utf8")),
  );
  for (let i = 0; i < removed.length; i += 200)
    git(dir, ["rm", "-q", "--", ...removed.slice(i, i + 200)]);
  if (fs.existsSync(path.join(dir, "case/README.md")))
    git(dir, ["mv", "-f", "case/README.md", "README.md"]);
  const pkg = path.join(dir, "package.json");
  fs.writeFileSync(
    pkg,
    pruneRootScripts(fs.readFileSync(pkg, "utf8"), removed),
  );
  refreshLockfile(dir);
  git(dir, ["add", "-A"]);
  git(dir, [
    ...who,
    "commit",
    "-q",
    "-m",
    `Cut ${CASE_START} from ${from} (${fromSha.slice(0, 7)})`,
  ]);
  git(dir, ["tag", "-f", CASE_START]);
  log(`${CASE_START}: removed ${removed.length} coach-only files`);

  const problems = {};
  if (fast) {
    const found = checkBase({ dir, base: null, terms, verify });
    if (found.length) problems[CASE_START] = found;
  }

  // The four bases, each with its own docs/agents/ values.
  const bases = {};
  for (const base of BASES) {
    git(dir, ["switch", "-q", "-C", base.baseBranch, CASE_START]);
    const keysFile = path.join(dir, "docs/agents/workshop.md");
    fs.writeFileSync(
      keysFile,
      setWorkshopKeys(fs.readFileSync(keysFile, "utf8"), {
        ...base,
        epic: (base.group === "demo" ? demoIssue : epic) ?? null,
      }),
    );
    if (base.group === "demo") {
      const skill = path.join(dir, ".agents/skills/say-it-back/SKILL.md");
      fs.mkdirSync(path.dirname(skill), { recursive: true });
      fs.writeFileSync(skill, SAY_IT_BACK);
    }
    git(dir, ["add", "-A"]);
    git(dir, [...who, "commit", "-q", "-m", `Cut ${base.baseBranch}`]);
    bases[base.baseBranch] = git(dir, ["rev-parse", "HEAD"]);
    const found = checkBase({ dir, base, terms, verify: fast ? null : verify });
    if (found.length) problems[base.baseBranch] = found;
    log(
      `${base.baseBranch}: ${found.length ? `${found.length} problem(s)` : "checked"}`,
    );
  }

  if (Object.keys(problems).length) {
    const error = new Error(
      `The cut isn't ready to push:\n${Object.entries(problems)
        .flatMap(([branch, list]) => list.map((p) => `  ${branch}: ${p}`))
        .join("\n")}`,
    );
    error.problems = problems;
    throw error;
  }
  return { dir, caseStart: git(dir, ["rev-parse", CASE_START]), bases };
}

export function pushCut({ dir, remote, force = false }) {
  const refs = [
    `refs/tags/${CASE_START}`,
    ...BASES.map((b) => `refs/heads/${b.baseBranch}`),
  ];
  const existing = git(dir, ["ls-remote", remote, ...refs]).trim();
  if (existing && !force)
    throw new Error(
      `${remote} already has ${existing
        .split("\n")
        .map((line) => line.split("\t")[1])
        .join(
          ", ",
        )}. A re-cut throws away anything groups pushed; pass --force only if that's what you want.`,
    );
  git(dir, [
    "push",
    "-q",
    ...(force ? ["--force"] : []),
    remote,
    ...refs.map((ref) => `${ref}:${ref}`),
  ]);
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      epic: { type: "string" },
      "demo-issue": { type: "string" },
      from: { type: "string", default: "main" },
      remote: { type: "string", default: "origin" },
      terms: { type: "string", default: DEFAULT_TERMS },
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      fast: { type: "boolean", default: false },
    },
  });
  if (!values.epic || !values["demo-issue"]) {
    console.error(
      "Usage: cut.mjs --epic <n> --demo-issue <n> [--dry-run] [--force] [--fast]",
    );
    process.exit(2);
  }
  const repoDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const issue = (n) => (n.startsWith("#") ? n : `#${n}`);
  try {
    const result = cut({
      repoDir,
      from: values.from,
      epic: issue(values.epic),
      demoIssue: issue(values["demo-issue"]),
      terms: readTerms(path.resolve(repoDir, values.terms)),
      fast: values.fast,
    });
    let remote = values.remote;
    if (values["dry-run"]) {
      remote = fs.mkdtempSync(path.join(os.tmpdir(), "workshop-cut-remote-"));
      git(remote, ["init", "-q", "--bare"]);
    } else if (gitOk(repoDir, ["remote", "get-url", remote])) {
      remote = git(repoDir, ["remote", "get-url", remote]);
    }
    pushCut({ dir: result.dir, remote, force: values.force });
    console.log(
      values["dry-run"]
        ? `Dry run: pushed ${CASE_START} and ${BASES.length} bases to ${remote}`
        : `Pushed ${CASE_START} and ${BASES.length} bases to ${values.remote}.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
