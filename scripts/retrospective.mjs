#!/usr/bin/env node
// The overnight retrospective (coach-only), run on the retrospective lead's laptop after the last push:
//
//   pnpm retro            gather every group's input, compute the team signals, run the retrospective skill on
//                         Opus, and write the draft into .live/data/retrospective.json. Nothing is pushed.
//   (review and correct the draft by hand: every claim has its evidence next to it)
//   pnpm retro --publish  validate the reviewed file, mark it reviewed, commit and push it for the deck
//
// The skill reads `.retro-input/`, which this builds per group: the history from where the group started, its
// working-out at the head, its PR timeline, and its observation history, plus the coaches' local log (never
// committed) and the team signals. Group skills are renamed `_claude`, so they're read, never loaded.
//
// Usage: node scripts/retrospective.mjs [--groups group-a,group-b,group-c] [--pr group-a=12 …]
//          [--data-dir .live/data] [--remote origin] [--log .scratch/workshop/coach/coach-log.md]
//          [--offline] [--publish] [--no-push]

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { liveGitHub } from "./lib/github.mjs";
import {
  RETROSPECTIVE_FILE,
  RETROSPECTIVE_SCHEMA,
  checkRetrospective,
  writeRetrospective,
} from "./lib/retrospective.mjs";
import { commitAndPush } from "./publish-live-data.mjs";
import { writeIndex } from "./reporter-input.mjs";
import {
  GROUPS,
  forkPoint,
  resolveTargets,
  teamSignals,
} from "./team-signals.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const DEFAULT_LOG = ".scratch/workshop/coach/coach-log.md";
// The sections the skill writes. The signals come from the script, never from the model.
export const SKILL_SECTIONS = [
  "sources",
  "routes",
  "isThisYou",
  "decisions",
  "driving",
  "mistakes",
  "shortlist",
];

// The schema the skill answers in: the retrospective's own, with only its sections.
export function agentSchema(schemaFile = RETROSPECTIVE_SCHEMA) {
  const schema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  delete schema.$schema;
  delete schema.$id;
  schema.properties = Object.fromEntries(
    SKILL_SECTIONS.map((key) => [key, schema.properties[key]]),
  );
  schema.required = [...SKILL_SECTIONS];
  return schema;
}

// What a group touched that the skill needs as text: the working-out, the context it wrote, its new skills.
function readable(file, workingOut) {
  return (
    (workingOut && file.startsWith(workingOut)) ||
    ["case/AGENTS.md", "case/GLOSSARY.md"].includes(file) ||
    file.startsWith("case/docs/") ||
    file.startsWith(".agents/skills/")
  );
}

export async function prepareRetroInput({
  repoDir,
  targets,
  github = null,
  dataDir,
  logFile,
  signals,
  out,
}) {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  for (const { group, base, head, pr, workingOut } of targets) {
    const dir = path.join(out, group);
    const start = forkPoint(repoDir, base, head);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "meta.json"),
      JSON.stringify(
        {
          group,
          pr,
          base,
          head: git(repoDir, ["rev-parse", head]),
          start,
          workingOut,
        },
        null,
        2,
      ) + "\n",
    );
    // Every commit with its time and the files it touched, oldest first.
    fs.writeFileSync(
      path.join(dir, "history.txt"),
      git(repoDir, [
        "log",
        "--reverse",
        "--format=%n%h %cI %s",
        "--name-status",
        `${start}..${head}`,
      ]) + "\n",
    );
    const changed = git(repoDir, ["diff", "--name-only", start, head])
      .split("\n")
      .filter(Boolean);
    for (const file of changed.filter((f) => readable(f, workingOut))) {
      if (!gitOk(repoDir, ["cat-file", "-e", `${head}:${file}`])) continue;
      const safe = file
        .split("/")
        .map((s) => (s === ".claude" ? "_claude" : s))
        .join("/");
      const target = path.join(dir, "files", safe);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(
        target,
        git(repoDir, ["show", `${head}:${file}`], { encoding: "buffer" }),
      );
    }
    if (github && pr) {
      const shas = await github.commitShas(pr);
      const timeline = {
        labels: await github.labelEvents(pr),
        ci: [],
      };
      for (const sha of shas)
        for (const run of await github.checkRuns(sha))
          timeline.ci.push({ sha, ...run });
      fs.writeFileSync(
        path.join(dir, "timeline.json"),
        JSON.stringify(timeline, null, 2) + "\n",
      );
    }
    const history = path.join(dataDir, "history", group);
    if (fs.existsSync(history))
      fs.cpSync(history, path.join(dir, "observations"), { recursive: true });
  }

  if (logFile && fs.existsSync(logFile))
    fs.copyFileSync(logFile, path.join(out, "coach-log.md"));
  if (signals)
    fs.writeFileSync(
      path.join(out, "signals.json"),
      JSON.stringify(signals, null, 2) + "\n",
    );
  writeIndex(out);
}

// The retrospective lead's own login, project settings only, and read-only tools.
export function claudeAgent({ cwd, schema, model = "claude-opus-5-5" }) {
  const result = spawnSync(
    "claude",
    [
      "-p",
      "/retrospective",
      "--setting-sources",
      "project",
      "--model",
      model,
      "--max-turns",
      "120",
      "--max-budget-usd",
      "15",
      "--allowedTools",
      "Read,Grep,Glob",
      "--disallowedTools",
      "Bash,Edit,Write,NotebookEdit,WebFetch,WebSearch,Task",
      "--output-format",
      "json",
      "--json-schema",
      JSON.stringify(schema),
    ],
    { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  const output = result.stdout ? JSON.parse(result.stdout) : {};
  if (result.status !== 0 || !output.structured_output)
    throw new Error(
      `The retrospective skill gave no answer (${output.subtype ?? `exit ${result.status}`}). ${result.stderr ?? ""}`.trim(),
    );
  return {
    sections: output.structured_output,
    cost: output.total_cost_usd ?? null,
  };
}

export async function runRetrospective({
  repoDir,
  dataDir,
  targets,
  github = null,
  logFile = path.join(repoDir, DEFAULT_LOG),
  runAgent = claudeAgent,
  out = path.join(repoDir, ".retro-input"),
}) {
  const signals = await teamSignals({ repoDir, groups: targets, github });
  await prepareRetroInput({
    repoDir,
    targets,
    github,
    dataDir,
    logFile,
    signals,
    out,
  });
  const { sections, cost } = await runAgent({
    cwd: repoDir,
    schema: agentSchema(),
  });
  const update = {
    ...Object.fromEntries(SKILL_SECTIONS.map((key) => [key, sections[key]])),
    signals,
    status: "draft",
  };
  const file = writeRetrospective({ dataDir, update });
  return { file, cost };
}

// After the coaches' review: valid, marked reviewed, committed and pushed.
export function publishRetrospective({ dataDir, push = true }) {
  const file = path.join(dataDir, RETROSPECTIVE_FILE);
  if (!fs.existsSync(file))
    throw new Error(
      `No ${RETROSPECTIVE_FILE} in ${dataDir}. Run the retrospective first.`,
    );
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = checkRetrospective(doc);
  if (errors.length)
    throw new Error(
      `Fix these before publishing:\n${errors.map((e) => `  ${e}`).join("\n")}`,
    );
  writeRetrospective({ dataDir, update: { status: "reviewed" } });
  return commitAndPush({
    dataDir,
    files: [RETROSPECTIVE_FILE],
    push,
    message: "The reviewed retrospective",
  });
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
      log: { type: "string", default: DEFAULT_LOG },
      offline: { type: "boolean", default: false },
      publish: { type: "boolean", default: false },
      "no-push": { type: "boolean", default: false },
    },
  });
  const dataDir = path.resolve(repoRoot, values["data-dir"]);
  try {
    if (!fs.existsSync(dataDir))
      throw new Error(
        `No data checkout at ${dataDir}. Run pnpm live:sync --once first.`,
      );
    if (values.publish) {
      const { pushed } = publishRetrospective({
        dataDir,
        push: !values["no-push"],
      });
      console.log(
        `Published the reviewed retrospective${pushed ? "" : " (committed, not pushed)"}.`,
      );
    } else {
      const repo = /github\.com[:/](.+?)(\.git)?$/.exec(
        git(repoRoot, ["remote", "get-url", values.remote]),
      )?.[1];
      const github = values.offline
        ? null
        : liveGitHub({
            repo,
            token:
              process.env.GH_TOKEN ??
              execFileSync("gh", ["auth", "token"], {
                encoding: "utf8",
              }).trim(),
          });
      if (!values.offline) git(repoRoot, ["fetch", "-q", values.remote]);
      const prs = Object.fromEntries(
        values.pr.map((pair) => [
          pair.split("=")[0],
          Number(pair.split("=")[1]),
        ]),
      );
      const targets = await resolveTargets({
        repoDir: repoRoot,
        dataDir,
        remote: values.remote,
        github,
        groups: values.groups
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        prs,
      });
      const { file, cost } = await runRetrospective({
        repoDir: repoRoot,
        dataDir,
        targets,
        github,
        logFile: path.resolve(repoRoot, values.log),
      });
      console.log(
        `Wrote the draft to ${path.join(values["data-dir"], file)}${cost ? ` ($${cost.toFixed(2)})` : ""}. ` +
          "Review every claim, correct what's wrong, then: pnpm retro --publish",
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
