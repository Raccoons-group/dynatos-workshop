#!/usr/bin/env node
// Waits until a commit's check run (the case's `test` job) has finished, so the reporter describes a commit
// with its CI result. Gives up quietly after a timeout: a card without CI beats no card.
//
// Usage: node scripts/wait-for-check.mjs --sha <commit> [--check test] [--timeout 900] [--interval 15] [--repo owner/name]

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { liveGitHub } from "./lib/github.mjs";

export async function waitForCheck({
  github,
  sha,
  check = "test",
  timeoutMs = 15 * 60_000,
  intervalMs = 15_000,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now = () => Date.now(),
}) {
  const until = now() + timeoutMs;
  for (;;) {
    // A re-run adds a second run with the same name, so wait until every one of them has finished.
    const runs = (await github.checkRuns(sha)).filter(
      (run) => run.name === check,
    );
    if (runs.length && runs.every((run) => run.status === "completed")) {
      const latest = runs.sort((a, b) =>
        (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
      )[0];
      return { done: true, conclusion: latest.conclusion };
    }
    if (now() >= until) return { done: false, conclusion: null };
    await sleep(intervalMs);
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      sha: { type: "string" },
      check: { type: "string", default: "test" },
      timeout: { type: "string", default: "900" },
      interval: { type: "string", default: "15" },
      repo: { type: "string" },
    },
  });
  const github = liveGitHub({
    repo: values.repo ?? process.env.GITHUB_REPOSITORY,
    token: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN,
  });
  const result = await waitForCheck({
    github,
    sha: values.sha,
    check: values.check,
    timeoutMs: Number(values.timeout) * 1000,
    intervalMs: Number(values.interval) * 1000,
  });
  console.log(
    result.done
      ? `${values.check} finished: ${result.conclusion}`
      : `${values.check} didn't finish within ${values.timeout} s; reporting without waiting longer.`,
  );
}
