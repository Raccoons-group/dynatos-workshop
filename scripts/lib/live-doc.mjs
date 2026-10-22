// Publishes one top-level JSON document (library.json, action-plan.json) to a checkout of the live-deck-data
// branch, which the deck serves as `snapshot.docs.<name>`. Shared by the Day 2 scripts.
//
// The document is capped and validated against its schema first: one that doesn't validate is never written, so
// the deck keeps the last good one. It's committed only when its content changed, so a script that runs every
// half minute doesn't flood the branch, and `updatedAt` is the time the content last changed.

import fs from "node:fs";
import path from "node:path";

import { commitAndPush, DATA_BRANCH } from "../publish-live-data.mjs";
import { git, gitOk } from "./git.mjs";
import { capStrings, loadSchema, validate } from "./schema.mjs";

const IDENTITY = [
  "-c",
  "user.name=live-deck",
  "-c",
  "user.email=live-deck@users.noreply.github.com",
];

// A coach's own checkout of the data branch, kept apart from the deck's synced copy in .live/data.
export function ensureDataCheckout({ repoDir, dataDir, remote = "origin" }) {
  if (fs.existsSync(path.join(dataDir, ".git"))) return;
  const tracking = `refs/remotes/${remote}/${DATA_BRANCH}`;
  git(repoDir, [
    "fetch",
    "-q",
    remote,
    `+refs/heads/${DATA_BRANCH}:${tracking}`,
  ]);
  git(repoDir, ["worktree", "prune"]);
  git(repoDir, ["worktree", "add", "-q", "--detach", dataDir, tracking]);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const withoutTime = ({ updatedAt, ...rest }) => JSON.stringify(rest);

export function publishDoc({
  dataDir,
  name,
  doc,
  schemaFile,
  message,
  now = new Date(),
  push = true,
}) {
  const file = `${name}.json`;
  const schema = loadSchema(schemaFile);
  const full = capStrings(schema, {
    schemaVersion: 1,
    updatedAt: now.toISOString(),
    ...doc,
  });
  const errors = validate(schema, full);
  if (errors.length) {
    const error = new Error(
      `${file} doesn't match its schema:\n${errors.map((e) => `  ${e}`).join("\n")}`,
    );
    error.errors = errors;
    throw error;
  }

  // Catch up with the remote first, so the comparison is against what the deck has. Offline, carry on.
  const synced =
    push &&
    gitOk(dataDir, [
      ...IDENTITY,
      "pull",
      "-q",
      "--rebase",
      "origin",
      DATA_BRANCH,
    ]);
  const previous = readJson(path.join(dataDir, file));
  if (previous && withoutTime(previous) === withoutTime(full)) {
    // Unchanged, but an earlier run may have committed without reaching the remote.
    const unpushed =
      synced &&
      git(dataDir, ["rev-list", "--count", "FETCH_HEAD..HEAD"]) !== "0";
    const pushed =
      unpushed &&
      gitOk(dataDir, ["push", "-q", "origin", `HEAD:${DATA_BRANCH}`]);
    return { doc: previous, file, changed: false, committed: false, pushed };
  }

  fs.writeFileSync(
    path.join(dataDir, file),
    JSON.stringify(full, null, 2) + "\n",
  );
  const result = commitAndPush({ dataDir, files: [file], message, push });
  return { doc: full, file, changed: true, ...result };
}
