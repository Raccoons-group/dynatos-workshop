#!/usr/bin/env node
// The coach-notes leak check. Participants can read every branch, so the names and rules planted in the case
// may appear only in the case's own source code. This fails, with file and line, when one of them turns up
// in any other committed file, the case's Markdown included.
//
// The terms are never committed: they're read at runtime from a gitignored list next to the coach notes, one
// term per line (# for comments). A term matches case-sensitively, as a whole word where it starts or ends
// with a letter or digit. The cut, the demo tags and the coaches' pre-push routine all run it.
//
// Usage: node scripts/leak-check.mjs [--terms .scratch/workshop/coach/leak-terms.txt] [--dir .]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { git } from "./lib/git.mjs";

export const DEFAULT_TERMS = ".scratch/workshop/coach/leak-terms.txt";

export function readTerms(file) {
  if (!fs.existsSync(file))
    throw new Error(
      `No term list at ${file}. It lives with the coach notes and is never committed; ask the other coach for it.`,
    );
  const terms = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean);
  if (!terms.length) throw new Error(`The term list at ${file} is empty.`);
  return terms;
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function matcher(term) {
  const start = /^\w/.test(term) ? "(?<![\\w])" : "";
  const end = /\w$/.test(term) ? "(?![\\w])" : "";
  return new RegExp(`${start}${escape(term)}${end}`);
}

// The case's source may name what's planted: that's where groups discover it. Its Markdown may not.
export function checked(file) {
  return !file.startsWith("case/") || file.endsWith(".md");
}

export function leakCheck({ dir, terms }) {
  const matchers = terms.map((term) => [term, matcher(term)]);
  const hits = [];
  // Committed files, plus new ones not yet added, so a check before committing catches them too.
  const files = git(dir, [
    "ls-files",
    "-z",
    "--cached",
    "--others",
    "--exclude-standard",
  ]);
  for (const file of new Set(files.split("\0").filter(Boolean))) {
    if (!checked(file)) continue;
    const full = path.join(dir, file);
    if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) continue;
    const buffer = fs.readFileSync(full);
    if (buffer.includes(0)) continue;
    buffer
      .toString("utf8")
      .split(/\r?\n/)
      .forEach((text, i) => {
        for (const [term, re] of matchers)
          if (re.test(text)) hits.push({ file, line: i + 1, term });
      });
  }
  return hits;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const { values } = parseArgs({
    options: {
      terms: { type: "string", default: DEFAULT_TERMS },
      dir: { type: "string", default: "." },
    },
  });
  const hits = leakCheck({ dir: values.dir, terms: readTerms(values.terms) });
  if (hits.length) {
    console.error(
      `✗ ${hits.length} planted term(s) outside the case's source:`,
    );
    for (const hit of hits)
      console.error(`  ${hit.file}:${hit.line}  ${hit.term}`);
    process.exit(1);
  }
  console.log("✓ no planted terms outside the case's source");
}
