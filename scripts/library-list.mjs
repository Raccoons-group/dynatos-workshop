#!/usr/bin/env node
// The Day 2 library list (the show-and-tell screen), computed here and never by a model. Coach-run during the lab.
//
// A lab PR is any open or merged PR into `main` that touches `.agents/skills/` or uses the lab PR template
// (.github/PULL_REQUEST_TEMPLATE/lab.md). For each, in the order they were opened:
//
//   name         the skill's folder under .agents/skills/, or the PR title for anything else
//   fixLevel     the ticked (or first) line of the PR's "Fix level" section
//   catches      the first line of the skill's description, or the PR's "What it catches" line
//   toolsPassed  the TESTS.md columns where every "Should fire" row is ticked ✅, three rows at least
//   state        open or merged
//
// No person's name: the owner stays in TESTS.md. The list is published as library.json at the top of the
// live-deck-data branch, which the deck reads as `snapshot.docs.library`.
//
// Usage: node scripts/library-list.mjs [--repo owner/name] [--since <time> | all] [--data-dir .live/publish]
//          [--no-push] [--watch <seconds>]
//
// Without --since, only PRs opened today count, so a coach's Day 1 fix to a skill never shows as a lab PR.
// The token comes from GH_TOKEN, GITHUB_TOKEN or a signed-in `gh`.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { parseFrontmatter } from "./check-skills.mjs";
import { git } from "./lib/git.mjs";
import { liveGitHub } from "./lib/github.mjs";
import { ensureDataCheckout, publishDoc } from "./lib/live-doc.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const LIBRARY_SCHEMA = path.join(here, "schemas", "library.schema.json");
export const LAB_MARKER = "<!-- lab-pr -->";
const SKILLS = ".agents/skills/";

// Each fix level and the words that name it. A line names the level whose word comes first.
const LEVEL_WORDS = [
  ["architecture", /\barchitecture\b/i],
  ["types", /\btypes?\b/i],
  ["check", /\b(checks?|lint|ci)\b/i],
  ["test", /\btests?\b/i],
  ["AGENTS.md", /\bagents\.md\b/i],
  ["skill", /\b(procedure|skills?)\b/i],
];

const isPlaceholder = (text) =>
  !text || /^<[^>]*>$/.test(text) || /^(…|\.\.\.)/.test(text);

// The lines under a "## <heading>" section, without HTML comments, up to the next heading of that level or higher.
export function sectionLines(markdown, heading) {
  const lines = (markdown ?? "").replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/);
  const start = lines.findIndex((line) => {
    const match = /^(#{1,6})\s+(.*)$/.exec(line);
    return match && heading.test(match[2].trim());
  });
  if (start === -1) return [];
  const level = /^#+/.exec(lines[start])[0].length;
  const out = [];
  for (const line of lines.slice(start + 1)) {
    const match = /^(#{1,6})\s/.exec(line);
    if (match && match[1].length <= level) break;
    out.push(line);
  }
  return out;
}

export function usesLabTemplate(body) {
  return (
    (body ?? "").includes(LAB_MARKER) ||
    /^#{1,6}\s+fix level\b/im.test(body ?? "")
  );
}

export function levelOf(line) {
  let best = null;
  for (const [level, words] of LEVEL_WORDS) {
    const index = line.search(words);
    if (index !== -1 && (best === null || index < best.index))
      best = { level, index };
  }
  return best?.level ?? null;
}

export function fixLevelFrom(body) {
  const lines = sectionLines(body, /^fix level\b/i)
    .map((line) => line.trim())
    .filter(Boolean);
  const ticked = lines.find((line) => /^[-*]\s+\[[xX]\]/.test(line));
  if (ticked) return levelOf(ticked.replace(/^[-*]\s+\[[xX]\]\s*/, ""));
  // Without a tick, the first line that isn't an empty box or the "why not higher" line, as in "check: …".
  const first = lines.find(
    (line) =>
      !/^[-*]\s+\[ \]/.test(line) &&
      !/^why not higher\b/i.test(line) &&
      !isPlaceholder(line),
  );
  return first ? levelOf(first) : null;
}

export function catchesFrom(body) {
  return (
    sectionLines(body, /^what it catches\b/i)
      .map((line) => line.trim().replace(/^[-*]\s+/, ""))
      .find((line) => !isPlaceholder(line)) ?? ""
  );
}

export function descriptionLine(skillMd) {
  const description = parseFrontmatter(skillMd ?? "")?.values.description;
  return (description ?? "").split("\n")[0].trim();
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());
}

// The tools whose every "Should fire" prompt is ticked ✅. A tool needs three ticked prompts at least.
export function toolsPassed(testsMd) {
  const rows = sectionLines(testsMd, /^should fire\b/i)
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !/^\s*\|?\s*:?-{1,}/.test(line))
    .map(tableCells);
  const [header, ...body] = rows;
  if (!header) return [];
  const prompts = body.filter((cells) => !isPlaceholder(cells[0]));
  if (prompts.length < 3) return [];
  return header
    .slice(1)
    .filter(
      (tool, i) =>
        tool && prompts.every((cells) => /✅|✔/.test(cells[i + 1] ?? "")),
    );
}

// The skill folders a PR adds or changes, new ones first.
export function skillFolders(files) {
  const folders = new Map();
  for (const { path: file, status } of files) {
    if (!file.startsWith(SKILLS) || file.split("/").length < 4) continue;
    if (status === "removed") continue;
    const folder = file.split("/")[2];
    const added = status === "added" && file.endsWith("/SKILL.md");
    folders.set(folder, folders.get(folder) || added);
  }
  return [...folders]
    .sort(
      ([a, newA], [b, newB]) =>
        Number(newB) - Number(newA) || a.localeCompare(b),
    )
    .map(([folder]) => folder);
}

// What the list says about one PR, or null when it isn't a lab PR. Cached by head commit across watch runs.
async function entryFor(github, pr, cache) {
  const key = `${pr.number}@${pr.headSha}`;
  if (!cache.has(key)) {
    const files = await github.pullRequestFiles(pr.number);
    const [skill] = skillFolders(files);
    let skillMd = null;
    let testsMd = null;
    if (skill) {
      skillMd = await github.fileAt(`${SKILLS}${skill}/SKILL.md`, pr.headSha);
      testsMd = await github.fileAt(`${SKILLS}${skill}/TESTS.md`, pr.headSha);
    }
    cache.set(key, { skill, skillMd, testsMd });
  }
  const { skill, skillMd, testsMd } = cache.get(key);
  if (!skill && !usesLabTemplate(pr.body)) return null;

  const catches = skill
    ? descriptionLine(skillMd) || catchesFrom(pr.body)
    : catchesFrom(pr.body);
  return {
    pr: pr.number,
    name: skill ?? pr.title,
    kind: skill ? "skill" : "fix",
    fixLevel: fixLevelFrom(pr.body) ?? (skill ? "skill" : null),
    catches,
    toolsPassed: skill ? toolsPassed(testsMd) : [],
    state: pr.state,
    openedAt: pr.createdAt,
  };
}

export async function libraryEntries({
  github,
  base = "main",
  since = null,
  cache = new Map(),
}) {
  const prs = (await github.pullRequests({ base }))
    .filter((pr) => pr.state === "open" || pr.state === "merged")
    .filter((pr) => !since || new Date(pr.createdAt) >= new Date(since))
    .sort((a, b) => a.number - b.number);
  const entries = [];
  for (const pr of prs) {
    const entry = await entryFor(github, pr, cache);
    if (entry) entries.push(entry);
  }
  return entries;
}

export async function publishLibrary({
  github,
  dataDir,
  base = "main",
  since = null,
  cache,
  now = new Date(),
  push = true,
}) {
  const entries = await libraryEntries({ github, base, since, cache });
  const merged = entries.filter((entry) => entry.state === "merged").length;
  return publishDoc({
    dataDir,
    name: "library",
    doc: { entries },
    schemaFile: LIBRARY_SCHEMA,
    message: `Library list: ${entries.length} lab PRs, ${merged} merged`,
    now,
    push,
  });
}

function repoFromRemote(repoDir) {
  try {
    const url = git(repoDir, ["remote", "get-url", "origin"]);
    return /github\.com[:/](.+?)(\.git)?$/.exec(url)?.[1] ?? null;
  } catch {
    return null;
  }
}

// A coach's laptop has `gh` signed in: borrow its token, so the API's rate limit is the signed-in one.
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

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      repo: { type: "string" },
      since: { type: "string" },
      "data-dir": { type: "string", default: ".live/publish" },
      "no-push": { type: "boolean", default: false },
      watch: { type: "string" },
    },
  });
  const repoDir = path.resolve(here, "..");
  const repo =
    values.repo ?? process.env.GITHUB_REPOSITORY ?? repoFromRemote(repoDir);
  const github = liveGitHub({
    repo,
    token: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? ghToken(),
  });
  const dataDir = path.resolve(repoDir, values["data-dir"]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since =
    values.since === "all" ? null : (values.since ?? today.toISOString());
  const cache = new Map();
  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;
    const time = new Date().toLocaleTimeString("en-GB");
    try {
      ensureDataCheckout({ repoDir, dataDir });
      const { doc, changed, pushed } = await publishLibrary({
        github,
        dataDir,
        since,
        cache,
        push: !values["no-push"],
      });
      console.log(
        `${time}  ${doc.entries.length} lab PRs${changed ? (pushed ? ", published" : ", written") : ", unchanged"}`,
      );
    } catch (error) {
      console.error(`${time}  ${error.message}`);
      if (!values.watch) process.exitCode = 1;
    } finally {
      running = false;
    }
  };
  await tick();
  if (values.watch) setInterval(tick, Number(values.watch) * 1000);
}
