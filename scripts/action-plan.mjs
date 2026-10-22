#!/usr/bin/env node
// The Day 2 action plan's grid, for the deck. Coach-run during the action plan.
//
// Each Day 1 group drafts its thread row in docs/action-plan/<thread>.md and opens a PR into `main`; a coach
// merges it as it lands. This script reads docs/action-plan/ from the remote's `main` (so a merge on GitHub is
// enough) and publishes the grid as action-plan.json at the top of the live-deck-data branch, which the deck reads
// as `snapshot.docs["action-plan"]`:
//
//   route.md, context.md, skills.md, checks.md   quick-win and longer-step candidates, up to 3 each
//   README.md                                    the grid's winners after the vote, never its owner columns
//
// Usage: node scripts/action-plan.mjs [--branch main] [--remote origin] [--data-dir .live/publish] [--no-push]
//          [--watch <seconds>]

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { ensureDataCheckout, publishDoc } from "./lib/live-doc.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const PLAN_SCHEMA = path.join(
  here,
  "schemas",
  "action-plan.schema.json",
);
export const PLAN_DIR = "docs/action-plan";
export const THREADS = [
  ["route", "Route"],
  ["context", "Context"],
  ["skills", "Skills"],
  ["checks", "Checks"],
];
const MAX_CANDIDATES = 3;

const isPlaceholder = (text) =>
  !text || /^<[^>]*>/.test(text) || /^(…|\.\.\.)/.test(text);

// "- <item>: <why>" → { item, why }. A bullet without a colon is all item.
function candidate(text) {
  const split = text.indexOf(": ");
  return split === -1
    ? { item: text.trim(), why: "" }
    : { item: text.slice(0, split).trim(), why: text.slice(split + 2).trim() };
}

export function parseRowDraft(markdown) {
  const lines = (markdown ?? "").replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/);
  const title = lines.find((line) => /^#\s/.test(line)) ?? "";
  const group = /drafted by group\s+([a-z0-9]+)\b/i.exec(title)?.[1];
  const row = {
    draftedBy: group ? `group-${group.toLowerCase()}` : null,
    quickWins: [],
    longerSteps: [],
  };
  let into = null;
  for (const line of lines) {
    const heading = /^#{2,6}\s+(.*)$/.exec(line);
    if (heading) {
      const text = heading[1].toLowerCase();
      into = text.startsWith("quick win")
        ? row.quickWins
        : text.startsWith("longer step")
          ? row.longerSteps
          : null;
      continue;
    }
    const bullet = /^\s{0,3}(?:[-*]|\d+[.)])\s+(.*)$/.exec(line);
    if (into && bullet && !isPlaceholder(bullet[1].trim()))
      into.push(candidate(bullet[1]));
  }
  row.quickWins = row.quickWins.slice(0, MAX_CANDIDATES);
  row.longerSteps = row.longerSteps.slice(0, MAX_CANDIDATES);
  return row;
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());
}

// The README's grid after the vote: per thread, the quick win and the longer step. The owner and review columns
// are never read, so no name reaches the deck.
export function parseChosen(readme) {
  const lines = (readme ?? "").split(/\r?\n/);
  const start = lines.findIndex(
    (line) =>
      line.trim().startsWith("|") && /^row$/i.test(tableCells(line)[0] ?? ""),
  );
  const chosen = {};
  if (start === -1) return chosen;
  const end = lines.findIndex(
    (line, i) => i > start && !line.trim().startsWith("|"),
  );
  const [header, ...rows] = lines
    .slice(start, end === -1 ? undefined : end)
    .map(tableCells);
  const quick = header.findIndex((cell) => /^quick win/i.test(cell));
  const longer = header.findIndex((cell) => /^longer step/i.test(cell));
  for (const cells of rows) {
    const thread = THREADS.find(([, label]) =>
      (cells[0] ?? "").toLowerCase().startsWith(label.toLowerCase()),
    )?.[0];
    if (!thread) continue;
    const value = (index) =>
      index > 0 && cells[index] && !isPlaceholder(cells[index])
        ? cells[index]
        : null;
    chosen[thread] = { quickWin: value(quick), longerStep: value(longer) };
  }
  return chosen;
}

// The grid as it stands at `ref`: only rows with a draft or a winner.
export function planAt({ repoDir, ref }) {
  const read = (file) =>
    gitOk(repoDir, ["cat-file", "-e", `${ref}:${PLAN_DIR}/${file}`])
      ? git(repoDir, ["show", `${ref}:${PLAN_DIR}/${file}`])
      : null;
  const chosen = parseChosen(read("README.md"));
  const rows = [];
  for (const [thread] of THREADS) {
    const draft = read(`${thread}.md`);
    const winners = chosen[thread] ?? { quickWin: null, longerStep: null };
    if (!draft && !winners.quickWin && !winners.longerStep) continue;
    rows.push({
      thread,
      ...(draft
        ? parseRowDraft(draft)
        : { draftedBy: null, quickWins: [], longerSteps: [] }),
      chosen: winners,
    });
  }
  return { rows };
}

export function publishPlan({
  repoDir,
  ref,
  dataDir,
  now = new Date(),
  push = true,
}) {
  const doc = planAt({ repoDir, ref });
  return publishDoc({
    dataDir,
    name: "action-plan",
    doc,
    schemaFile: PLAN_SCHEMA,
    message: `Action plan: ${doc.rows.map((row) => row.thread).join(", ") || "no rows yet"}`,
    now,
    push,
  });
}

// One run as the coach's laptop does it: fetch the remote's main, so a merge on GitHub is enough, then publish.
// Offline, the last fetched main still publishes.
export function refreshPlan({
  repoDir,
  dataDir,
  remote = "origin",
  branch = "main",
  now = new Date(),
  push = true,
}) {
  const tracking = `refs/remotes/${remote}/${branch}`;
  gitOk(repoDir, ["fetch", "-q", remote, `+refs/heads/${branch}:${tracking}`]);
  ensureDataCheckout({ repoDir, dataDir, remote });
  return publishPlan({ repoDir, ref: tracking, dataDir, now, push });
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      branch: { type: "string", default: "main" },
      remote: { type: "string", default: "origin" },
      "data-dir": { type: "string", default: ".live/publish" },
      "no-push": { type: "boolean", default: false },
      watch: { type: "string" },
    },
  });
  const repoDir = path.resolve(here, "..");
  const dataDir = path.resolve(repoDir, values["data-dir"]);

  const tick = () => {
    const time = new Date().toLocaleTimeString("en-GB");
    try {
      const { doc, changed, pushed } = refreshPlan({
        repoDir,
        dataDir,
        remote: values.remote,
        branch: values.branch,
        push: !values["no-push"],
      });
      console.log(
        `${time}  ${doc.rows.length} rows${changed ? (pushed ? ", published" : ", written") : ", unchanged"}`,
      );
    } catch (error) {
      console.error(`${time}  ${error.message}`);
      if (!values.watch) process.exitCode = 1;
    }
  };
  tick();
  if (values.watch) setInterval(tick, Number(values.watch) * 1000);
}
