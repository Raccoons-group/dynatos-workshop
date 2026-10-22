#!/usr/bin/env node
// The reporter's local fallback (`pnpm report:local --pr <n>`), for when CI or the wifi fails. It runs the same
// target check, prep and publish scripts as the workflow; only the agent call differs: `claude -p` with
// project settings only, instead of claude-code-action. Keep the agent's flags in step with reporter.yml.
//
// It publishes into `.live/data`, the worktree `pnpm live:sync` keeps, so the deck shows the card at once,
// even offline. When the push fails, the commit waits there and the next sync rebases it, never drops it.
//
// Usage: node scripts/report-local.mjs --pr <n> [--repo owner/name] [--no-push]

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git, gitOk } from "./lib/git.mjs";
import { liveGitHub } from "./lib/github.mjs";
import { ghRunner, syncOnce } from "./live-sync.mjs";
import { DATA_BRANCH, publish } from "./publish-live-data.mjs";
import { buildReporterInput } from "./reporter-input.mjs";
import { reporterTarget } from "./reporter-target.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

// The schema the agent must answer in, without the keys a JSON Schema validator may not know.
export function agentSchema(repoDir = repoRoot) {
  const schema = JSON.parse(
    fs.readFileSync(
      path.join(
        repoDir,
        ".claude",
        "skills",
        "reporter",
        "judgements.schema.json",
      ),
      "utf8",
    ),
  );
  delete schema.$schema;
  delete schema.$id;
  return schema;
}

// The same caps and tools as the workflow's claude_args.
export function claudeAgent({ cwd, schema, model = "claude-sonnet-5-5" }) {
  const result = spawnSync(
    "claude",
    [
      "-p",
      "/reporter",
      "--setting-sources",
      "project",
      "--model",
      model,
      "--max-turns",
      "20",
      "--max-budget-usd",
      "1",
      "--allowedTools",
      "Read,Grep,Glob",
      "--disallowedTools",
      "Bash,Edit,Write,NotebookEdit,WebFetch,WebSearch,Task",
      "--output-format",
      "json",
      "--json-schema",
      JSON.stringify(schema),
    ],
    { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  const output = result.stdout ? JSON.parse(result.stdout) : {};
  if (result.status !== 0 || !output.structured_output)
    throw new Error(
      `The reporter gave no judgements (${output.subtype ?? `exit ${result.status}`}). ${result.stderr ?? ""}`.trim(),
    );
  return {
    judgements: output.structured_output,
    cost: output.total_cost_usd ?? null,
    turns: output.num_turns ?? null,
  };
}

export async function reportLocal({
  repoDir,
  pr,
  github,
  runAgent = claudeAgent,
  schema = agentSchema(),
  liveDir = path.join(repoDir, ".live"),
  push = true,
  gh = ghRunner,
}) {
  const { baseRef, headRef } = await github.pullRequest(pr);
  git(repoDir, [
    "fetch",
    "-q",
    "origin",
    `+refs/heads/${baseRef}:refs/remotes/origin/${baseRef}`,
    `+refs/heads/${headRef}:refs/remotes/origin/${headRef}`,
  ]);
  const base = git(repoDir, ["rev-parse", `origin/${baseRef}`]);
  const head = git(repoDir, ["rev-parse", `origin/${headRef}`]);

  const target = reporterTarget({
    keysText: gitOk(repoDir, [
      "cat-file",
      "-e",
      `${base}:docs/agents/workshop.md`,
    ])
      ? git(repoDir, ["show", `${base}:docs/agents/workshop.md`])
      : "",
    baseRef,
    headRef,
  });
  if (target.skip) return { skipped: target.skip };
  if (target.error) throw new Error(target.error);

  const out = path.join(repoDir, ".reporter-input");
  fs.rmSync(out, { recursive: true, force: true });
  const { facts } = await buildReporterInput({
    repoDir,
    base,
    head,
    pr,
    out,
    github,
  });
  const agent = await runAgent({ cwd: repoDir, schema });

  const dataDir = path.join(liveDir, "data");
  if (!fs.existsSync(path.join(dataDir, ".git")))
    syncOnce({ repoDir, liveDir, gh });
  const published = {
    group: target.group,
    pr,
    sha: head,
    facts,
    judgements: agent.judgements,
  };
  const run = { cost: agent.cost, turns: agent.turns };
  try {
    return { ...publish({ dataDir, push, ...published }), ...run };
  } catch (error) {
    // An observation that doesn't match the schema was never written.
    if (error.errors) throw error;
    // Committed but not pushed: the deck reads .live/data, so the card is already on screen.
    const waiting = Number(
      git(dataDir, ["rev-list", "--count", `origin/${DATA_BRANCH}..HEAD`]),
    );
    if (!waiting) throw error;
    return { committed: true, pushed: false, error: error.message, ...run };
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      pr: { type: "string" },
      repo: { type: "string" },
      "no-push": { type: "boolean", default: false },
    },
  });
  if (!values.pr) {
    console.error(
      "Usage: report-local.mjs --pr <n> [--repo owner/name] [--no-push]",
    );
    process.exit(2);
  }
  const token =
    process.env.GH_TOKEN ??
    execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
  const repo =
    values.repo ??
    execFileSync(
      "gh",
      ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    ).trim();
  const result = await reportLocal({
    repoDir: repoRoot,
    pr: Number(values.pr),
    github: liveGitHub({ repo, token }),
    push: !values["no-push"],
  });
  if (result.skipped) console.log(`Skipped: ${result.skipped}`);
  else if (result.pushed)
    console.log(
      `Published #${values.pr} (${result.turns ?? "?"} turns, $${result.cost ?? "?"}).`,
    );
  else
    console.log(
      `Committed #${values.pr} in .live/data, not pushed${result.error ? ` (${result.error.split("\n")[0]})` : ""}. ` +
        "The deck shows it now; push it once you're online: git -C .live/data push origin HEAD:live-deck-data",
    );
}
