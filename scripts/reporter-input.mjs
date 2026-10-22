#!/usr/bin/env node
// The reporter's prep step, shared by CI and a coach's laptop. From a group's base and head it builds the
// reporter input folder:
//
//   facts.json    every number and timestamp, computed here and never by the model
//   meta.json     group, PR, refs and working-out folder
//   diff.patch    the diff against the base, without lockfiles, truncated
//   diffstat.txt
//   files/…       the working-out, case/AGENTS.md, the glossary and new shared skills, as plain files.
//                 Any `.claude` folder in a path becomes `_claude`, so a group's skills are read, never loaded.
//
// Usage: node scripts/reporter-input.mjs --base <ref> --head <ref> --pr <n> [--out .reporter-input]
//          [--repo owner/name] [--offline] [--ci-result pass|fail|cancelled --ci-at <time>] [--ci-check <name>]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { liveGitHub } from "./lib/github.mjs";
import { parseWorkshopKeys } from "./lib/workshop-keys.mjs";

const LOCKFILES = [
  ":(exclude,glob)**/pnpm-lock.yaml",
  ":(exclude,glob)**/package-lock.json",
  ":(exclude,glob)**/yarn.lock",
  ":(exclude,glob)**/packages.lock.json",
];
const MAX_DIFF_BYTES = 150_000;
const MAX_FILE_BYTES = 200_000;
export const SPEC_REVIEWED = "spec-reviewed";

// The first rule that matches wins.
export function phaseFor({
  draft,
  reviewPresent,
  codeChanged,
  ticketsPresent,
  specReviewed,
  specPresent,
}) {
  if (!draft) return "PR ready";
  if (reviewPresent) return "Reviewing";
  if (codeChanged) return "Building";
  if (ticketsPresent) return "Slicing";
  if (specReviewed) return "Spec reviewed";
  if (specPresent) return "Specifying";
  return "Exploring";
}

export function areasFor(paths, workingOut) {
  const isApiTest = (p) =>
    /(^|\/)[^/]*\.Tests?\//.test(p) || /Tests?\.cs$/.test(p);
  const isWebTest = (p) =>
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(p) || p.includes("/__tests__/");
  const api = paths.filter((p) => p.startsWith("case/api/"));
  const web = paths.filter((p) => p.startsWith("case/web/"));
  return {
    api: api.some((p) => !isApiTest(p)),
    web: web.some((p) => !isWebTest(p)),
    apiTests: api.some(isApiTest),
    webTests: web.some(isWebTest),
    agentContext: paths.some(
      (p) =>
        p === "case/AGENTS.md" ||
        p === "case/GLOSSARY.md" ||
        p.startsWith("case/docs/adr/"),
    ),
    workingOut:
      Boolean(workingOut) && paths.some((p) => p.startsWith(workingOut)),
  };
}

// Names of new test cases in the added lines of a unified diff: xUnit [Fact]/[Theory] methods, Vitest it()/test().
export function testsAddedFromDiff(diff) {
  const names = [];
  let file = "";
  let pendingAttribute = false;
  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ ")) {
      file = line.replace(/^\+\+\+ (b\/)?/, "");
      pendingAttribute = false;
      continue;
    }
    if (!line.startsWith("+")) continue;
    const added = line.slice(1);
    if (file.endsWith(".cs")) {
      if (/\[(Fact|Theory)\b/.test(added)) pendingAttribute = true;
      const method = /\b(?:Task|ValueTask|void)\s+(\w+)\s*\(/.exec(added);
      if (pendingAttribute && method) {
        names.push(method[1]);
        pendingAttribute = false;
      }
    } else if (
      /\.(test|spec)\.[cm]?[jt]sx?$/.test(file) ||
      file.includes("/__tests__/")
    ) {
      const pattern =
        /\b(?:it|test)(?:\.(?:only|skip|todo|concurrent))?\(\s*(['"`])((?:\\.|(?!\1).)+)\1/g;
      for (const match of added.matchAll(pattern)) names.push(match[2]);
    }
  }
  return [...new Set(names)];
}

// review.md: one "## Round n" section per review round, with "### Act on / Consider / Noted / Dismissed" and one
// "- " bullet per finding.
export function reviewFromMarkdown(markdown) {
  const findings = { actOn: 0, consider: 0, noted: 0, dismissed: 0 };
  const buckets = {
    "act on": "actOn",
    consider: "consider",
    noted: "noted",
    dismissed: "dismissed",
  };
  let rounds = 0;
  let sawBucket = false;
  let bucket = null;
  for (const line of (markdown ?? "").split(/\r?\n/)) {
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (heading) {
      const text = heading[1].trim().toLowerCase();
      if (/^round\b/.test(text)) rounds++;
      const name = Object.keys(buckets).find((key) => text.startsWith(key));
      bucket = name ? buckets[name] : null;
      if (bucket) sawBucket = true;
      continue;
    }
    if (bucket && /^[-*]\s+\S/.test(line)) findings[bucket]++;
  }
  return { rounds: rounds || (sawBucket ? 1 : 0), findings };
}

function ciFromRuns(runs, checkName) {
  const finished = runs
    .filter(
      (run) =>
        run.name === checkName && run.status === "completed" && run.completedAt,
    )
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const latest = finished.at(-1);
  if (!latest) return null;
  const result =
    latest.conclusion === "success"
      ? "pass"
      : latest.conclusion === "cancelled"
        ? "cancelled"
        : "fail";
  return { result, at: latest.completedAt };
}

export async function buildReporterInput({
  repoDir,
  base,
  head,
  pr,
  out,
  github = null,
  ciCheck = "test",
  ciOverride = null,
  maxDiffBytes = MAX_DIFF_BYTES,
}) {
  const keys = parseWorkshopKeys(
    gitOk(repoDir, ["cat-file", "-e", `${base}:docs/agents/workshop.md`])
      ? git(repoDir, ["show", `${base}:docs/agents/workshop.md`])
      : "",
  );
  const workingOut = keys.workingOut;
  const mergeBase = git(repoDir, ["merge-base", base, head]);
  const headSha = git(repoDir, ["rev-parse", head]);

  const nameStatus = git(repoDir, [
    "diff",
    "--name-status",
    "--no-renames",
    mergeBase,
    head,
  ])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("\t"));
  const changed = nameStatus.map(([, file]) => file);

  const fullDiff = git(repoDir, [
    "diff",
    mergeBase,
    head,
    "--",
    ".",
    ...LOCKFILES,
  ]);
  const diff =
    Buffer.byteLength(fullDiff) > maxDiffBytes
      ? Buffer.from(fullDiff).subarray(0, maxDiffBytes).toString() +
        `\n… diff truncated at ${maxDiffBytes} bytes …\n`
      : fullDiff;
  const diffstat = git(repoDir, [
    "diff",
    "--stat=200",
    mergeBase,
    head,
    "--",
    ".",
    ...LOCKFILES,
  ]);

  const existsAtHead = (file) =>
    gitOk(repoDir, ["cat-file", "-e", `${head}:${file}`]);
  const filesAtHead = (dir) =>
    git(repoDir, ["ls-tree", "-r", "--name-only", head, "--", dir])
      .split("\n")
      .filter(Boolean);
  const readAtHead = (file) =>
    existsAtHead(file) ? git(repoDir, ["show", `${head}:${file}`]) : null;
  const timesOf = (target) => {
    const times = git(repoDir, [
      "log",
      "--format=%cI",
      `${mergeBase}..${head}`,
      "--",
      target,
    ])
      .split("\n")
      .filter(Boolean);
    return {
      firstSeenAt: times.at(-1) ?? null,
      lastChangedAt: times[0] ?? null,
    };
  };
  const artifact = (target, present) =>
    present
      ? { present, ...timesOf(target) }
      : { present, firstSeenAt: null, lastChangedAt: null };

  const ticketsDir = workingOut ? `${workingOut}issues/` : null;
  const ticketsPresent =
    Boolean(ticketsDir) &&
    filesAtHead(ticketsDir).some((file) => file.endsWith(".md"));
  const at = (name) => (workingOut ? `${workingOut}${name}` : null);
  const artifacts = {
    agentsMd: artifact("case/AGENTS.md", existsAtHead("case/AGENTS.md")),
    glossary: artifact("case/GLOSSARY.md", existsAtHead("case/GLOSSARY.md")),
    spec: artifact(
      at("spec.md"),
      Boolean(workingOut) && existsAtHead(at("spec.md")),
    ),
    tickets: artifact(ticketsDir, ticketsPresent),
    review: artifact(
      at("review.md"),
      Boolean(workingOut) && existsAtHead(at("review.md")),
    ),
    howWeWorked: artifact(
      at("how-we-worked.md"),
      Boolean(workingOut) && existsAtHead(at("how-we-worked.md")),
    ),
  };

  const skillsWritten = [
    ...new Set(
      nameStatus
        .filter(
          ([status, file]) =>
            status === "A" &&
            file.startsWith(".agents/skills/") &&
            file.split("/").length > 3,
        )
        .map(([, file]) => file.split("/")[2])
        .filter(
          (name) =>
            !gitOk(repoDir, [
              "cat-file",
              "-e",
              `${mergeBase}:.agents/skills/${name}`,
            ]),
        ),
    ),
  ].sort();

  const areasTouched = areasFor(changed, workingOut);
  const testsAdded = testsAddedFromDiff(fullDiff);
  const review = reviewFromMarkdown(
    workingOut ? readAtHead(at("review.md")) : null,
  );
  const lastPushAt = git(repoDir, ["log", "-1", "--format=%cI", head]);

  let draft = true;
  let specReviewedAt = null;
  let ci = ciOverride;
  let firstGreenAt = null;
  if (github) {
    const pull = await github.pullRequest(pr);
    draft = Boolean(pull?.draft);
    let reviewedAt = null;
    for (const event of await github.labelEvents(pr)) {
      if (event.label !== SPEC_REVIEWED) continue;
      reviewedAt = event.action === "labeled" ? event.at : null;
    }
    specReviewedAt = reviewedAt;
    if (!ci) ci = ciFromRuns(await github.checkRuns(headSha), ciCheck);
    const greens = [];
    for (const sha of await github.commitShas(pr)) {
      for (const run of await github.checkRuns(sha)) {
        if (
          run.name === ciCheck &&
          run.conclusion === "success" &&
          run.completedAt
        )
          greens.push(run.completedAt);
      }
    }
    firstGreenAt = greens.sort()[0] ?? null;
  }
  if (!firstGreenAt && ci?.result === "pass") firstGreenAt = ci.at;

  const facts = {
    phase: phaseFor({
      draft,
      reviewPresent: artifacts.review.present,
      codeChanged:
        areasTouched.api ||
        areasTouched.web ||
        areasTouched.apiTests ||
        areasTouched.webTests,
      ticketsPresent,
      specReviewed: Boolean(specReviewedAt),
      specPresent: artifacts.spec.present,
    }),
    draft,
    specReviewedAt,
    ci: ci ?? null,
    firstGreenAt,
    artifacts,
    skillsWritten,
    areasTouched,
    testsAdded,
    review,
    lastPushAt,
  };

  const copies = [
    ...(workingOut ? filesAtHead(workingOut) : []),
    ...["case/AGENTS.md", "case/GLOSSARY.md"].filter(existsAtHead),
    ...skillsWritten.flatMap((name) => filesAtHead(`.agents/skills/${name}`)),
  ];
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "files"), { recursive: true });
  for (const file of copies) {
    const content = git(repoDir, ["show", `${head}:${file}`], {
      encoding: "buffer",
    });
    if (content.length > MAX_FILE_BYTES) continue;
    const safe = file
      .split("/")
      .map((segment) => (segment === ".claude" ? "_claude" : segment))
      .join("/");
    fs.mkdirSync(path.dirname(path.join(out, "files", safe)), {
      recursive: true,
    });
    fs.writeFileSync(path.join(out, "files", safe), content);
  }

  const meta = { group: keys.group, pr, base, head, sha: headSha, workingOut };
  fs.writeFileSync(
    path.join(out, "facts.json"),
    JSON.stringify(facts, null, 2) + "\n",
  );
  fs.writeFileSync(
    path.join(out, "meta.json"),
    JSON.stringify(meta, null, 2) + "\n",
  );
  fs.writeFileSync(path.join(out, "diff.patch"), diff);
  fs.writeFileSync(path.join(out, "diffstat.txt"), diffstat + "\n");
  writeIndex(out);
  return { facts, meta };
}

// index.txt lists every file in the input folder. The folder is gitignored, and an agent's file search may skip
// ignored files, so the skills read their paths from this list instead of searching.
export function writeIndex(out) {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [path.relative(out, full)];
    });
  const files = walk(out)
    .filter((file) => file !== "index.txt")
    .map((file) => file.split(path.sep).join("/"))
    .sort();
  fs.writeFileSync(path.join(out, "index.txt"), files.join("\n") + "\n");
}

function repoFromRemote(repoDir) {
  try {
    const url = git(repoDir, ["remote", "get-url", "origin"]);
    return /github\.com[:/](.+?)(\.git)?$/.exec(url)?.[1] ?? null;
  } catch {
    return null;
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      base: { type: "string" },
      head: { type: "string" },
      pr: { type: "string" },
      out: { type: "string", default: ".reporter-input" },
      repo: { type: "string" },
      offline: { type: "boolean", default: false },
      "ci-result": { type: "string" },
      "ci-at": { type: "string" },
      "ci-check": { type: "string", default: "test" },
    },
  });
  if (!values.base || !values.head || !values.pr) {
    console.error(
      "Usage: reporter-input.mjs --base <ref> --head <ref> --pr <n> [--out dir] [--offline]",
    );
    process.exit(2);
  }
  const repoDir = process.cwd();
  const repo =
    values.repo ?? process.env.GITHUB_REPOSITORY ?? repoFromRemote(repoDir);
  const github = values.offline
    ? null
    : liveGitHub({
        repo,
        token: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN,
      });
  const ciOverride = values["ci-result"]
    ? {
        result: values["ci-result"],
        at: values["ci-at"] ?? new Date().toISOString(),
      }
    : null;
  const { facts, meta } = await buildReporterInput({
    repoDir,
    base: values.base,
    head: values.head,
    pr: Number(values.pr),
    out: values.out,
    github,
    ciCheck: values["ci-check"],
    ciOverride,
  });
  console.log(
    `${meta.group ?? "(no group)"} #${meta.pr}: ${facts.phase}, CI ${facts.ci?.result ?? "none"} → ${values.out}/`,
  );
}
