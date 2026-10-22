#!/usr/bin/env node
// Makes the shared skills in .agents/skills visible to Claude Code, which only reads .claude/skills.
// Runs at `postinstall` and as `pnpm skills:link`. Safe to run any number of times.
//
// 1. Adopt: a real folder in .claude/skills (Claude's own "make a skill" flow writes there) moves into
//    .agents/skills and is linked back, so the gitignore never swallows a group's skill.
// 2. Link: every .agents/skills/<name> gets a link .claude/skills/<name>.
// 3. Prune: links whose skill no longer exists are removed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Claude-only coach skills that are committed as real folders in .claude/skills and never adopted.
export const CLAUDE_ONLY = new Set(["reporter", "retrospective"]);

const isWindows = process.platform === "win32";

function lstatOrNull(p) {
  try {
    return fs.lstatSync(p);
  } catch {
    return null;
  }
}

function skillFolders(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function pointsTo(linkPath, target) {
  try {
    return fs.realpathSync(linkPath) === fs.realpathSync(target);
  } catch {
    return false;
  }
}

function makeLink(sharedPath, linkPath) {
  if (isWindows) {
    // Junctions need no admin rights or Developer Mode, but must use an absolute target.
    fs.symlinkSync(path.resolve(sharedPath), linkPath, "junction");
  } else {
    fs.symlinkSync(
      path.relative(path.dirname(linkPath), sharedPath),
      linkPath,
      "dir",
    );
  }
}

export function linkSkills({ root, log = () => {} }) {
  const shared = path.join(root, ".agents", "skills");
  const claude = path.join(root, ".claude", "skills");
  const result = { adopted: [], linked: [], pruned: [], skipped: [] };

  fs.mkdirSync(shared, { recursive: true });
  fs.mkdirSync(claude, { recursive: true });

  for (const entry of fs.readdirSync(claude, { withFileTypes: true })) {
    const name = entry.name;
    const claudePath = path.join(claude, name);
    const stat = lstatOrNull(claudePath);
    if (
      !stat ||
      stat.isSymbolicLink() ||
      !stat.isDirectory() ||
      CLAUDE_ONLY.has(name)
    )
      continue;

    const sharedPath = path.join(shared, name);
    if (fs.existsSync(sharedPath)) {
      result.skipped.push(name);
      log(
        `! .claude/skills/${name} is a real folder, but .agents/skills/${name} exists too. Left both alone: merge them by hand.`,
      );
      continue;
    }
    fs.renameSync(claudePath, sharedPath);
    result.adopted.push(name);
    log(`→ adopted .claude/skills/${name} into .agents/skills/${name}`);
  }

  for (const entry of fs.readdirSync(claude, { withFileTypes: true })) {
    const linkPath = path.join(claude, entry.name);
    const stat = lstatOrNull(linkPath);
    if (stat?.isSymbolicLink() && !fs.existsSync(linkPath)) {
      fs.unlinkSync(linkPath);
      result.pruned.push(entry.name);
      log(`- removed the stale link .claude/skills/${entry.name}`);
    }
  }

  for (const name of skillFolders(shared)) {
    const sharedPath = path.join(shared, name);
    const linkPath = path.join(claude, name);
    const stat = lstatOrNull(linkPath);

    if (stat?.isSymbolicLink()) {
      if (pointsTo(linkPath, sharedPath)) continue;
      fs.unlinkSync(linkPath);
    } else if (stat) {
      if (!result.skipped.includes(name)) {
        result.skipped.push(name);
        log(`! .claude/skills/${name} exists and isn't a link. Left it alone.`);
      }
      continue;
    }
    makeLink(sharedPath, linkPath);
    result.linked.push(name);
  }

  return result;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const result = linkSkills({ root, log: (line) => console.log(line) });
  const total = skillFolders(path.join(root, ".agents", "skills")).length;
  console.log(
    `skills: ${total} shared, ${result.linked.length} newly linked for Claude Code`,
  );
}
