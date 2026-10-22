#!/usr/bin/env node
// Keeps the presenter laptop's copy of the live deck's data current (`pnpm live:sync`). Coach-only: the cut
// leaves it off the group branches.
//
//   .live/data/       a worktree of the live-deck-data branch, fast-forwarded every ~10 s
//   .live/meta.json   when the last fetch worked, the last error, and the repo's PR list (for the opener)
//
// Observations a coach published locally while offline are rebased onto what arrives, never thrown away.
// When the network is down, the deck keeps showing what it last had.
//
// Usage: node scripts/live-sync.mjs [--once] [--interval 10] [--dir .live] [--remote origin]

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { DATA_BRANCH } from "./publish-live-data.mjs";
import { git, gitOk } from "./lib/git.mjs";

const PR_FIELDS =
  "number,title,state,isDraft,headRefName,baseRefName,updatedAt";

export function ghRunner(args, cwd) {
  return execFileSync("gh", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readMeta(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { lastFetchAt: null, lastFetchError: null, prs: [] };
  }
}

// Written whole and renamed into place, so the deck never reads half a file.
function writeMeta(file, meta) {
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(meta, null, 2) + "\n");
  fs.renameSync(`${file}.tmp`, file);
}

export function syncOnce({
  repoDir,
  liveDir,
  remote = "origin",
  gh = ghRunner,
  now = () => new Date(),
}) {
  const dataDir = path.join(liveDir, "data");
  const metaFile = path.join(liveDir, "meta.json");
  const tracking = `refs/remotes/${remote}/${DATA_BRANCH}`;
  const meta = readMeta(metaFile);
  fs.mkdirSync(liveDir, { recursive: true });

  try {
    git(repoDir, [
      "fetch",
      "-q",
      remote,
      `+refs/heads/${DATA_BRANCH}:${tracking}`,
    ]);
    if (!fs.existsSync(path.join(dataDir, ".git"))) {
      git(repoDir, ["worktree", "prune"]);
      git(repoDir, ["worktree", "add", "-q", "--detach", dataDir, tracking]);
    } else if (!gitOk(dataDir, ["merge", "-q", "--ff-only", tracking])) {
      if (!gitOk(dataDir, ["rebase", "-q", tracking])) {
        gitOk(dataDir, ["rebase", "--abort"]);
        throw new Error(
          `.live/data and ${DATA_BRANCH} have diverged and don't rebase cleanly`,
        );
      }
    }
    meta.lastFetchAt = now().toISOString();
    meta.lastFetchError = null;
  } catch (error) {
    meta.lastFetchError = String(error.message ?? error).split("\n")[0];
  }

  try {
    meta.prs = JSON.parse(
      gh(
        ["pr", "list", "--state", "all", "--limit", "100", "--json", PR_FIELDS],
        repoDir,
      ),
    );
  } catch {
    // Keep the last PR list we had.
  }

  writeMeta(metaFile, meta);
  return meta;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      once: { type: "boolean", default: false },
      interval: { type: "string", default: "10" },
      dir: { type: "string", default: ".live" },
      remote: { type: "string", default: "origin" },
    },
  });
  const repoDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const liveDir = path.resolve(repoDir, values.dir);
  const tick = () => {
    const meta = syncOnce({ repoDir, liveDir, remote: values.remote });
    const time = new Date().toLocaleTimeString("en-GB");
    console.log(
      meta.lastFetchError
        ? `${time}  offline: ${meta.lastFetchError}`
        : `${time}  synced, ${meta.prs.length} PRs`,
    );
  };
  tick();
  if (!values.once) setInterval(tick, Number(values.interval) * 1000);
}
