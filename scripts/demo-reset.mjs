#!/usr/bin/env node
// Restarts a demo segment from a fallback tag (coach-only, on main): `pnpm demo:reset demo/04-sliced`.
// It force-pushes the tag's commit to the demo's work branch, so CI and the reporter run for it and the card
// follows, and makes the PR match the tag the way the demo script's tag table says. It never closes the PR,
// so its number and its card stay. Any worktree here that has the work branch checked out is reset too.
//
// Usage: node scripts/demo-reset.mjs <tag> [--repo owner/name] [--remote origin]

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { parseWorkshopKeys } from "./lib/workshop-keys.mjs";

export const DEMO_BASE = "demo/main";
export const DEMO_BRANCH = "demo/allergens";
export const LABEL = "spec-reviewed";
export const TITLE = "Show allergens on the menu";

// The demo script's tag table: the GitHub state each fallback tag stands for.
export const TAG_STATE = {
  "demo/01-read": { pr: false },
  "demo/02-explored": { pr: false },
  "demo/03-specified": { pr: true, draft: true, specReviewed: true },
  "demo/04-sliced": { pr: true, draft: true, specReviewed: true },
  "demo/05-built": { pr: true, draft: true, specReviewed: true },
  "demo/06-reviewed": { pr: true, draft: true, specReviewed: true },
  "demo/07-shipped": { pr: true, draft: false, specReviewed: true },
  "demo/08-learned": { pr: true, draft: false, specReviewed: true },
};

export function ghRunner(args) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

// The worktree that has the demo branch checked out, if any.
function demoWorktree(repoDir) {
  const list = git(repoDir, ["worktree", "list", "--porcelain"]).split("\n\n");
  const entry = list.find((block) =>
    block.includes(`branch refs/heads/${DEMO_BRANCH}`),
  );
  return entry ? /^worktree (.+)$/m.exec(entry)[1] : null;
}

export function demoReset({
  repoDir,
  tag,
  repo,
  remote = "origin",
  gh = ghRunner,
  log = console.log,
}) {
  const state = TAG_STATE[tag];
  if (!state)
    throw new Error(
      `${tag} isn't a fallback tag. Use one of: ${Object.keys(TAG_STATE).join(", ")}.`,
    );

  git(repoDir, [
    "fetch",
    "-q",
    remote,
    "+refs/tags/demo/*:refs/tags/demo/*",
    `+refs/heads/${DEMO_BASE}:refs/remotes/${remote}/${DEMO_BASE}`,
  ]);
  const sha = git(repoDir, ["rev-parse", `refs/tags/${tag}^{commit}`]);

  // The branch, here and on GitHub.
  const worktree = demoWorktree(repoDir);
  if (worktree) git(worktree, ["reset", "-q", "--hard", sha]);
  else git(repoDir, ["branch", "-f", DEMO_BRANCH, sha]);
  git(repoDir, [
    "push",
    "-q",
    "--force",
    remote,
    `${sha}:refs/heads/${DEMO_BRANCH}`,
  ]);
  log(
    `${DEMO_BRANCH} → ${tag} (${sha.slice(0, 7)})${worktree ? `, and ${worktree} reset` : ""}`,
  );

  // The PR.
  const open = JSON.parse(
    gh([
      "pr",
      "list",
      "--repo",
      repo,
      "--head",
      DEMO_BRANCH,
      "--base",
      DEMO_BASE,
      "--state",
      "open",
      "--json",
      "number,isDraft,labels",
    ]),
  );
  let pr = open[0];
  if (!pr && !state.pr) {
    log("No PR, as the tag says.");
    return { sha, pr: null };
  }
  if (!pr) {
    const keys = parseWorkshopKeys(
      git(repoDir, [
        "show",
        `refs/remotes/${remote}/${DEMO_BASE}:docs/agents/workshop.md`,
      ]),
    );
    const url = gh([
      "pr",
      "create",
      "--repo",
      repo,
      "--base",
      DEMO_BASE,
      "--head",
      DEMO_BRANCH,
      "--draft",
      "--title",
      TITLE,
      "--body",
      keys.epic ? `Part of ${keys.epic}` : "",
    ]).trim();
    pr = { number: Number(url.split("/").pop()), isDraft: true, labels: [] };
    log(`Opened #${pr.number} as a draft.`);
  }
  // A tag before the PR existed can't take the PR away: it goes back to a draft without the label.
  const draft = state.pr ? state.draft : true;
  const labelled = state.pr ? state.specReviewed : false;
  if (draft !== pr.isDraft) {
    gh([
      "pr",
      "ready",
      String(pr.number),
      "--repo",
      repo,
      ...(draft ? ["--undo"] : []),
    ]);
    log(draft ? `#${pr.number} back to draft.` : `#${pr.number} marked ready.`);
  }
  const hasLabel = pr.labels.some((label) => label.name === LABEL);
  if (labelled !== hasLabel) {
    gh([
      "pr",
      "edit",
      String(pr.number),
      "--repo",
      repo,
      labelled ? "--add-label" : "--remove-label",
      LABEL,
    ]);
    log(`${labelled ? "Added" : "Removed"} ${LABEL}.`);
  }
  return { sha, pr: pr.number };
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      repo: { type: "string" },
      remote: { type: "string", default: "origin" },
    },
  });
  const repoDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  if (!positionals[0]) {
    console.error(
      `Usage: demo-reset.mjs <tag>, one of: ${Object.keys(TAG_STATE).join(", ")}`,
    );
    process.exit(2);
  }
  const repo =
    values.repo ??
    ghRunner([
      "repo",
      "view",
      "--json",
      "nameWithOwner",
      "--jq",
      ".nameWithOwner",
    ]).trim();
  try {
    demoReset({ repoDir, tag: positionals[0], repo, remote: values.remote });
    if (
      !gitOk(repoDir, [
        "rev-parse",
        "--verify",
        "-q",
        `refs/heads/${DEMO_BRANCH}`,
      ])
    )
      console.log(
        `In a separate demo clone: git fetch && git reset --hard origin/${DEMO_BRANCH}`,
      );
  } catch (error) {
    console.error(error.message.split("\n")[0]);
    process.exit(1);
  }
}
