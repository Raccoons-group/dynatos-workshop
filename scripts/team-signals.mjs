#!/usr/bin/env node
// The five team signals for the Day 2 retrospective, computed from each group's git history and PR timeline, never
// by the model. A coach runs it overnight after the last push. It writes `signals` into retrospective.json on the
// live-deck-data branch and leaves the synthesis's sections alone, so it can run before or after the synthesis.
//
//   time from intent to spec   working minutes from the kickoff to the spec-reviewed label, lunch excluded
//   spec rework                the commits that changed the spec after the label
//   first-pass CI              per slice, its CI runs up to the first green
//   review rounds              rounds in review.md, counted as the reporter counts them
//   drift                      slices planned vs shipped, and changed files the final spec and tickets never name
//
// A slice is a ticket in the working-out's issues folder. A CI run belongs to the slice in progress at its commit:
// the ticket that is claimed there, or else the first ticket that wasn't done before the commit. Runs count only once
// that slice has changed code, so the case's own green tests never pass for a slice nobody has started. When no
// ticket's Status line ever moves, all runs go to one entry with a null ticket.
//
// Usage: GH_TOKEN=$(gh auth token) node scripts/team-signals.mjs [--groups group-a,group-b,group-c]
//          [--pr group-a=12 …] [--data-dir .live/data] [--remote origin] [--repo owner/name] [--offline]
//          [--ci-check test] [--no-push]
//
// Each group's base is <remote>/<group>/main, its PR comes from groups/<group>.json on the data branch (or --pr),
// and its head is the PR's head commit (offline: the work branch in the base's docs/agents/workshop.md).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { liveGitHub } from "./lib/github.mjs";
import { writeRetrospective } from "./lib/retrospective.mjs";
import { parseWorkshopKeys } from "./lib/workshop-keys.mjs";
import { commitAndPush } from "./publish-live-data.mjs";
import {
  areasFor,
  reviewFromMarkdown,
  SPEC_REVIEWED,
} from "./reporter-input.mjs";

export const TIME_ZONE = "Europe/Amsterdam";
export const KICKOFF = "11:10";
export const LUNCH = { from: "12:40", to: "14:05" };
export const GROUPS = ["group-a", "group-b", "group-c"];
const LOCKFILES = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "packages.lock.json",
];
const MAX_RUNS = 100;
const MAX_OUTSIDE = 200;

const minutesOf = (hhmm) => {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
};

// Minutes past midnight on the workshop's wall clock, whatever the laptop's time zone.
function wallClock(iso, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return (
    Number(parts.hour) * 60 + Number(parts.minute) + Number(parts.second) / 60
  );
}

// Whole working minutes from the kickoff to `iso` on the same day, lunch excluded. Zero before the kickoff.
export function workingMinutes(
  iso,
  { kickoff = KICKOFF, lunch = LUNCH, timeZone = TIME_ZONE } = {},
) {
  const start = minutesOf(kickoff);
  const end = wallClock(iso, timeZone);
  const lunchTaken = Math.max(
    0,
    Math.min(end, minutesOf(lunch.to)) - Math.max(start, minutesOf(lunch.from)),
  );
  return Math.floor(Math.max(0, end - start) - lunchTaken);
}

// When the label went on for the last time, or null if it's off now: the same reading as the reporter's facts.
export function specReviewedAt(labelEvents) {
  let at = null;
  for (const event of labelEvents) {
    if (event.label === SPEC_REVIEWED)
      at = event.action === "labeled" ? event.at : null;
  }
  return at;
}

// A ticket's Status line, plain or bold ("Status: done", "**Status:** done"), lower-cased, or null.
export function statusOf(markdown) {
  return (
    /^[\s*_-]*Status[\s*_]*:[\s*_]*([a-z-]+)/im
      .exec(markdown)?.[1]
      .toLowerCase() ?? null
  );
}

// The ticket's first heading without its number ("# 01: Start a group order" → "Start a group order"), or the
// file's slug.
export function titleOf(ticket, markdown) {
  const heading = /^#\s+(.+?)\s*$/m.exec(markdown)?.[1];
  const title = heading?.replace(/^\d+\s*[:.)-]\s*/, "").trim();
  return (
    title || ticket.replace(/\.md$/, "").replace(/^\d+-/, "").replace(/-/g, " ")
  );
}

// Lower-cased words, camelCase split and a plural "s" dropped, so "GroupOrdersController" reads like "group order
// controller" in a spec.
function words(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) =>
      word.length > 3 && word.endsWith("s") && !word.endsWith("ss")
        ? word.slice(0, -1)
        : word,
    );
}

// A changed file is in the plan when the spec or a ticket names it: its path anywhere, or, inside case/, its file
// name, or its compound name in words without extensions and test suffixes ("GroupOrderPage.test.tsx" → "group
// order page"). A one-word name like App or Program needs its file name: "the web app" doesn't name App.tsx.
export function inPlan(file, planText) {
  if (planText.includes(file)) return true;
  if (!file.startsWith("case/")) return false;
  const base = path.posix.basename(file);
  const name = words(base.split(".")[0]);
  while (name.length && ["test", "spec"].includes(name.at(-1))) name.pop();
  if (name.length < 2) return planText.includes(base);
  return ` ${words(planText).join(" ")} `.includes(` ${name.join(" ")} `);
}

// The commit the group's branch started from: the newest commit on the base's own line that the head contains.
// Unlike merge-base, this still works after the group has merged its PR into the base.
export function forkPoint(repoDir, base, head) {
  for (const sha of git(repoDir, ["rev-list", "--first-parent", base]).split(
    "\n",
  )) {
    if (gitOk(repoDir, ["merge-base", "--is-ancestor", sha, head])) return sha;
  }
  throw new Error(`${head} shares no history with ${base}.`);
}

function ticketsAt(repoDir, commit, issuesDir) {
  const tickets = new Map();
  if (!issuesDir) return tickets;
  const files = git(repoDir, [
    "ls-tree",
    "-r",
    "--name-only",
    commit,
    "--",
    issuesDir,
  ])
    .split("\n")
    .filter(
      (file) =>
        file.endsWith(".md") && !file.slice(issuesDir.length).includes("/"),
    )
    .sort();
  for (const file of files) {
    const ticket = file.slice(issuesDir.length);
    const markdown = git(repoDir, ["show", `${commit}:${file}`]);
    tickets.set(ticket, {
      ticket,
      title: titleOf(ticket, markdown),
      status: statusOf(markdown),
    });
  }
  return tickets;
}

// Oldest first, with each commit's committer time and the files it changed.
function commitsBetween(repoDir, from, head) {
  return git(repoDir, [
    "log",
    "--reverse",
    "--topo-order",
    "--format=%x00%H %cI",
    "--name-only",
    `${from}..${head}`,
  ])
    .split("\0")
    .filter(Boolean)
    .map((chunk) => {
      const [first, ...files] = chunk.split("\n").filter(Boolean);
      const [sha, at] = first.split(" ");
      return { sha, at, files };
    });
}

function ciRunsOf(runs, ciCheck) {
  return runs
    .filter(
      (run) =>
        run.name === ciCheck && run.status === "completed" && run.completedAt,
    )
    .filter(
      (run) =>
        !["cancelled", "skipped", "neutral", "stale"].includes(run.conclusion),
    )
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .map((run) => ({
      at: run.completedAt,
      result: run.conclusion === "success" ? "pass" : "fail",
    }));
}

// The slice a commit works on: a ticket claimed after it, or else the first ticket that wasn't done before it.
function sliceInProgress(before, after) {
  const claimed = [...after.values()].find((t) => t.status === "claimed");
  if (claimed) return claimed.ticket;
  return [...before.values()].find((t) => t.status !== "done")?.ticket ?? null;
}

export async function groupSignals({
  repoDir,
  group,
  base,
  head,
  pr = null,
  github = null,
  ciCheck = "test",
  kickoff = KICKOFF,
  lunch = LUNCH,
  timeZone = TIME_ZONE,
}) {
  const keys = parseWorkshopKeys(
    gitOk(repoDir, ["cat-file", "-e", `${base}:docs/agents/workshop.md`])
      ? git(repoDir, ["show", `${base}:docs/agents/workshop.md`])
      : "",
  );
  const workingOut = keys.workingOut;
  const issuesDir = workingOut ? `${workingOut}issues/` : null;
  const from = forkPoint(repoDir, base, head);
  const headSha = git(repoDir, ["rev-parse", head]);
  const readAtHead = (file) =>
    file && gitOk(repoDir, ["cat-file", "-e", `${headSha}:${file}`])
      ? git(repoDir, ["show", `${headSha}:${file}`])
      : null;

  const online = Boolean(github && pr);
  const labelledAt = online
    ? specReviewedAt(await github.labelEvents(pr))
    : null;

  // Spec rework: commits that touched the spec after the label.
  const specFile = workingOut ? `${workingOut}spec.md` : null;
  const changes =
    labelledAt && specFile
      ? git(repoDir, [
          "log",
          "--reverse",
          "--format=%H %cI",
          `${from}..${headSha}`,
          "--",
          specFile,
        ])
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const [sha, at] = line.split(" ");
            return { sha, at };
          })
          .filter((change) => new Date(change.at) > new Date(labelledAt))
      : [];

  // Walk the commits once, reading the tickets' Status lines wherever a commit touched them.
  const commits = commitsBetween(repoDir, from, headSha);
  let before = ticketsAt(repoDir, from, issuesDir);
  let firstPlan = before.size ? before : null;
  let tracked = false;
  const titles = new Map([...before.values()].map((t) => [t.ticket, t.title]));
  const walked = [];
  for (const commit of commits) {
    const after =
      issuesDir && commit.files.some((file) => file.startsWith(issuesDir))
        ? ticketsAt(repoDir, commit.sha, issuesDir)
        : before;
    for (const t of after.values()) {
      titles.set(t.ticket, t.title);
      if (t.status === "claimed" || t.status === "done") tracked = true;
    }
    if (!firstPlan && after.size) firstPlan = after;
    const areas = areasFor(commit.files, workingOut);
    walked.push({
      ...commit,
      slice: sliceInProgress(before, after),
      code: areas.api || areas.web || areas.apiTests || areas.webTests,
    });
    before = after;
  }
  const final = ticketsAt(repoDir, headSha, issuesDir);

  // First-pass CI: each slice's runs, from its first code change up to its first green.
  const buckets = new Map();
  for (const commit of walked) {
    const key = tracked ? commit.slice : "";
    if (key === null) continue;
    if (!buckets.has(key))
      buckets.set(key, { code: false, green: false, runs: [] });
    const bucket = buckets.get(key);
    if (commit.code) bucket.code = true;
    if (!bucket.code || bucket.green || !online) continue;
    for (const run of ciRunsOf(await github.checkRuns(commit.sha), ciCheck)) {
      if (bucket.green || bucket.runs.length >= MAX_RUNS) break;
      bucket.runs.push({ sha: commit.sha, ...run });
      if (run.result === "pass") bucket.green = true;
    }
  }
  const sliceKeys = tracked
    ? [
        ...new Set([
          ...final.keys(),
          ...[...buckets.keys()].filter((k) => buckets.get(k).runs.length),
        ]),
      ].sort()
    : [""];
  const slices = sliceKeys.map((key) => ({
    ticket: key || null,
    title: key ? titles.get(key) : null,
    runs: buckets.get(key)?.runs ?? [],
  }));

  // Review rounds.
  const reviewFile = workingOut ? `${workingOut}review.md` : null;
  const review = readAtHead(reviewFile);

  // Drift: the first tickets written against the tickets at the head, and changed files the plan never names.
  const ref = ({ ticket, title }) => ({ ticket, title });
  const planned = [...(firstPlan ?? new Map()).values()];
  const shipped = [...final.values()].filter((t) => t.status === "done");
  const added = [...final.values()].filter((t) => !firstPlan?.has(t.ticket));
  const dropped = planned.filter((t) => !final.has(t.ticket));
  const planText = [
    readAtHead(specFile) ?? "",
    ...[...final.keys()].map(
      (ticket) => readAtHead(`${issuesDir}${ticket}`) ?? "",
    ),
  ].join("\n");
  const newSkill = (file) => {
    const [, , name] = file.split("/");
    return (
      file.startsWith(".agents/skills/") &&
      file.split("/").length > 3 &&
      !gitOk(repoDir, ["cat-file", "-e", `${from}:.agents/skills/${name}`])
    );
  };
  const outsidePlan = git(repoDir, [
    "diff",
    "--name-only",
    "--no-renames",
    from,
    headSha,
  ])
    .split("\n")
    .filter(Boolean)
    .filter(
      (file) =>
        !(workingOut && file.startsWith(workingOut)) &&
        !LOCKFILES.includes(path.posix.basename(file)) &&
        file !== "case/AGENTS.md" &&
        file !== "case/GLOSSARY.md" &&
        !file.startsWith("case/docs/adr/") &&
        !newSkill(file),
    )
    .filter((file) => !inPlan(file, planText))
    .slice(0, MAX_OUTSIDE);

  return {
    group,
    pr,
    from,
    head: headSha,
    timeToSpec: {
      labelledAt,
      minutes: labelledAt
        ? workingMinutes(labelledAt, { kickoff, lunch, timeZone })
        : null,
    },
    specRework: { changes },
    firstPassCi: { slices },
    reviewRounds: {
      rounds: reviewFromMarkdown(review).rounds,
      file: review === null ? null : reviewFile,
    },
    drift: {
      planned: planned.map(ref),
      shipped: shipped.map(ref),
      added: added.map(ref),
      dropped: dropped.map(ref),
      outsidePlan,
    },
  };
}

// `groups` is a list of { group, base, head, pr }. The result is the retrospective's `signals` section.
export async function teamSignals({
  repoDir,
  groups,
  github = null,
  ciCheck = "test",
  computedAt = new Date().toISOString(),
}) {
  const results = [];
  for (const target of [...groups].sort((a, b) =>
    a.group.localeCompare(b.group),
  ))
    results.push(await groupSignals({ repoDir, github, ciCheck, ...target }));
  return {
    computedAt,
    timeZone: TIME_ZONE,
    kickoff: KICKOFF,
    lunch: LUNCH,
    ciCheck,
    groups: results,
  };
}

// Writes the signals into the data checkout's retrospective.json and commits them (and pushes, unless told not to).
export function publishSignals({ dataDir, signals, push = true }) {
  const file = writeRetrospective({ dataDir, update: { signals } });
  return {
    file,
    ...commitAndPush({
      dataDir,
      files: [file],
      push,
      message: `Team signals for ${signals.groups.map((g) => g.group).join(", ")}`,
    }),
  };
}

// Each group's base (<remote>/<group>/main), its PR (from the data branch, or `prs`) and the head to read: the
// PR's head commit, or the work branch. Groups without a base or a head are skipped, with a line on stderr. The
// retrospective reads the same targets.
export async function resolveTargets({
  repoDir,
  dataDir,
  remote,
  github = null,
  groups = GROUPS,
  prs = {},
  warn = (line) => console.error(line),
}) {
  const ref = (branch) => (remote ? `${remote}/${branch}` : branch);
  const targets = [];
  for (const group of groups) {
    const base = ref(`${group}/main`);
    if (!gitOk(repoDir, ["rev-parse", "--verify", "-q", base])) {
      warn(`! ${group}: no ${base}, skipped.`);
      continue;
    }
    const keys = parseWorkshopKeys(
      gitOk(repoDir, ["cat-file", "-e", `${base}:docs/agents/workshop.md`])
        ? git(repoDir, ["show", `${base}:docs/agents/workshop.md`])
        : "",
    );
    const pr = prs[group] ?? prFromData(dataDir, group) ?? null;
    let head = keys.workBranch ? ref(keys.workBranch) : null;
    if (github && pr) head = (await github.pullRequest(pr))?.headSha ?? head;
    if (
      !head ||
      !gitOk(repoDir, ["rev-parse", "--verify", "-q", `${head}^{commit}`])
    ) {
      warn(`! ${group}: no work branch or PR head to read, skipped.`);
      continue;
    }
    if (!pr) warn(`! ${group}: no PR found, so no label and no CI.`);
    targets.push({ group, base, head, pr, workingOut: keys.workingOut });
  }
  return targets;
}

// One line per group for the coach's terminal.
export function summaryOf(g) {
  const ci = g.firstPassCi.slices
    .map((slice) => {
      const red = slice.runs.filter((run) => run.result === "fail").length;
      const green = slice.runs.some((run) => run.result === "pass");
      return `${slice.ticket?.replace(/\.md$/, "") ?? "all"} ${red} red${green ? ", then green" : ""}`;
    })
    .join("; ");
  return `${g.group}${g.pr ? ` #${g.pr}` : ""}: ${[
    g.timeToSpec.minutes === null
      ? "no label"
      : `${g.timeToSpec.minutes} min to spec`,
    `${g.specRework.changes.length} spec changes after`,
    `CI ${ci || "none"}`,
    `${g.reviewRounds.rounds} review rounds`,
    `${g.drift.planned.length} planned, ${g.drift.shipped.length} shipped, ${g.drift.outsidePlan.length} files outside the plan`,
  ].join(" · ")}`;
}

function repoFromRemote(repoDir, remote) {
  try {
    const url = git(repoDir, ["remote", "get-url", remote]);
    return /github\.com[:/](.+?)(\.git)?$/.exec(url)?.[1] ?? null;
  } catch {
    return null;
  }
}

function ghToken() {
  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

function prFromData(dataDir, group) {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(dataDir, "groups", `${group}.json`), "utf8"),
    ).pr;
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
      groups: { type: "string", default: GROUPS.join(",") },
      pr: { type: "string", multiple: true, default: [] },
      "data-dir": { type: "string", default: ".live/data" },
      remote: { type: "string", default: "origin" },
      repo: { type: "string" },
      offline: { type: "boolean", default: false },
      "ci-check": { type: "string", default: "test" },
      "no-push": { type: "boolean", default: false },
    },
  });
  const repoDir = process.cwd();
  const dataDir = path.resolve(values["data-dir"]);
  const remote = values.remote;
  const prs = Object.fromEntries(
    values.pr.map((pair) => {
      const [group, number] = pair.split("=");
      return [group, Number(number)];
    }),
  );
  if (!fs.existsSync(dataDir)) {
    console.error(
      `No data checkout at ${dataDir}. Run pnpm live:sync --once first.`,
    );
    process.exit(2);
  }

  const github = values.offline
    ? null
    : liveGitHub({
        repo:
          values.repo ??
          process.env.GITHUB_REPOSITORY ??
          repoFromRemote(repoDir, remote),
        token: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? ghToken(),
      });
  if (!values.offline && remote) git(repoDir, ["fetch", "-q", remote]);

  const targets = await resolveTargets({
    repoDir,
    dataDir,
    remote,
    github,
    groups: values.groups
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean),
    prs,
  });

  try {
    const signals = await teamSignals({
      repoDir,
      groups: targets,
      github,
      ciCheck: values["ci-check"],
    });
    for (const g of signals.groups) console.log(summaryOf(g));
    const { file, committed, pushed } = publishSignals({
      dataDir,
      signals,
      push: !values["no-push"],
    });
    console.log(
      committed
        ? `Wrote ${file}${pushed ? ", pushed to live-deck-data" : ""}.`
        : `${file} was already up to date.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
