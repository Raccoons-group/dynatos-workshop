#!/usr/bin/env node
// The reporter's publish step, shared by CI and a coach's laptop. It merges the prep script's facts with the
// reporter skill's judgements, caps every string to the schema, validates the result, and writes it to the
// `live-deck-data` branch:
//
//   groups/<group>.json                   the latest observation, overwritten on every run
//   history/<group>/<time>-<pr>.json      an append-only snapshot, for the overnight retrospective
//
// One file per group means concurrent publishers never edit the same file, so a rebase always resolves a race.
// A file that fails validation is never written: the deck keeps showing the last good one.
//
// Usage: node scripts/publish-live-data.mjs --group <g> --pr <n> --sha <sha> --facts <file> --judgements <file>
//          --data-dir <checkout of live-deck-data> [--no-push]
//        node scripts/publish-live-data.mjs --init [--repo-dir .] [--remote origin]

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { capStrings, loadSchema, validate } from "./lib/schema.mjs";

export const DATA_BRANCH = "live-deck-data";
const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SCHEMA = path.resolve(
  here,
  "..",
  ".claude",
  "skills",
  "reporter",
  "observation.schema.json",
);
const IDENTITY = [
  "-c",
  "user.name=live-deck",
  "-c",
  "user.email=live-deck@users.noreply.github.com",
];

export function buildObservation({
  group,
  pr,
  sha,
  facts,
  judgements,
  reportedAt = new Date().toISOString(),
  schemaFile = DEFAULT_SCHEMA,
}) {
  const schema = loadSchema(schemaFile);
  const observation = capStrings(schema, {
    group,
    pr,
    sha,
    reportedAt,
    schemaVersion: 1,
    facts,
    judgements,
  });
  const errors = validate(schema, observation);
  if (errors.length) {
    const error = new Error(
      `The observation doesn't match the schema:\n${errors.map((e) => `  ${e}`).join("\n")}`,
    );
    error.errors = errors;
    throw error;
  }
  return observation;
}

export function writeObservation({ dataDir, observation }) {
  const stamp = new Date(observation.reportedAt)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+/, "");
  const latest = path.join("groups", `${observation.group}.json`);
  const snapshot = path.join(
    "history",
    observation.group,
    `${stamp}-${observation.pr}.json`,
  );
  for (const file of [latest, snapshot]) {
    fs.mkdirSync(path.dirname(path.join(dataDir, file)), { recursive: true });
    fs.writeFileSync(
      path.join(dataDir, file),
      JSON.stringify(observation, null, 2) + "\n",
    );
  }
  return [latest, snapshot];
}

export function commitAndPush({
  dataDir,
  files,
  message,
  push = true,
  attempts = 5,
}) {
  git(dataDir, ["add", "--", ...files]);
  if (gitOk(dataDir, ["diff", "--cached", "--quiet"]))
    return { committed: false, pushed: false, attempts: 0 };
  git(dataDir, [...IDENTITY, "commit", "-q", "-m", message]);
  if (!push) return { committed: true, pushed: false, attempts: 0 };

  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (gitOk(dataDir, ["push", "-q", "origin", `HEAD:${DATA_BRANCH}`]))
      return { committed: true, pushed: true, attempts: attempt };
    git(dataDir, [
      ...IDENTITY,
      "pull",
      "-q",
      "--rebase",
      "origin",
      DATA_BRANCH,
    ]);
  }
  throw new Error(
    `Couldn't push to ${DATA_BRANCH} after ${attempts} attempts.`,
  );
}

export function publish({ dataDir, push = true, ...input }) {
  const observation = buildObservation(input);
  const files = writeObservation({ dataDir, observation });
  const result = commitAndPush({
    dataDir,
    files,
    push,
    message: `${observation.group} #${observation.pr} at ${observation.sha.slice(0, 7)}: ${observation.facts.phase}`,
  });
  return { observation, files, ...result };
}

// Once, by a coach: create the orphan data branch on the remote.
export function initDataBranch({ repoDir, remote = "origin" }) {
  if (
    gitOk(repoDir, ["ls-remote", "--exit-code", "--heads", remote, DATA_BRANCH])
  )
    return { created: false };
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "live-deck-data-"));
  try {
    git(work, ["init", "-q", "-b", DATA_BRANCH]);
    fs.writeFileSync(
      path.join(work, "README.md"),
      "# live-deck-data\n\nWritten only by the reporter's publish step. The deck syncs this branch; nobody edits it by hand.\n\n" +
        "- `groups/<group>.json`: the latest observation per group\n" +
        "- `history/<group>/`: every observation, for the overnight retrospective\n",
    );
    for (const dir of ["groups", "history"]) {
      fs.mkdirSync(path.join(work, dir));
      fs.writeFileSync(path.join(work, dir, ".gitkeep"), "");
    }
    git(work, ["add", "."]);
    git(work, [
      ...IDENTITY,
      "commit",
      "-q",
      "-m",
      "Start the live deck's data branch",
    ]);
    const url = git(repoDir, ["remote", "get-url", remote]);
    git(work, ["push", "-q", url, `HEAD:refs/heads/${DATA_BRANCH}`]);
    return { created: true };
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      init: { type: "boolean", default: false },
      "repo-dir": { type: "string", default: "." },
      remote: { type: "string", default: "origin" },
      group: { type: "string" },
      pr: { type: "string" },
      sha: { type: "string" },
      facts: { type: "string" },
      judgements: { type: "string" },
      "data-dir": { type: "string", default: ".live-data" },
      schema: { type: "string", default: DEFAULT_SCHEMA },
      "no-push": { type: "boolean", default: false },
    },
  });

  if (values.init) {
    const { created } = initDataBranch({
      repoDir: values["repo-dir"],
      remote: values.remote,
    });
    console.log(
      created
        ? `Created ${DATA_BRANCH} on ${values.remote}.`
        : `${DATA_BRANCH} already exists on ${values.remote}.`,
    );
  } else {
    for (const key of ["group", "pr", "sha", "facts", "judgements"]) {
      if (!values[key]) {
        console.error(`Missing --${key}.`);
        process.exit(2);
      }
    }
    const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
    try {
      const { files, pushed } = publish({
        dataDir: values["data-dir"],
        push: !values["no-push"],
        group: values.group,
        pr: Number(values.pr),
        sha: values.sha,
        facts: readJson(values.facts),
        judgements: readJson(values.judgements),
        schemaFile: values.schema,
      });
      console.log(
        `Wrote ${files.join(" and ")}${pushed ? `, pushed to ${DATA_BRANCH}` : ""}.`,
      );
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
}
