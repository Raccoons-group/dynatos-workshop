// The library list for Day 2's show and tell: one row per lab PR into main, in the order the PRs were opened. It
// reads library.json, which scripts/library-list.mjs computes from the PRs without a model. The plugin only checks
// that the file parses, so an entry that isn't the expected shape is left out rather than drawn wrong.

import { hhmm } from "./format";

// The workshop's tools, always in this order. A pair that also tested in another tool gets that one after them.
export const TOOLS = ["Claude Code", "Codex", "Copilot"] as const;

export const FIX_LEVELS = {
  architecture: "Architecture",
  types: "Types",
  check: "Check",
  test: "Test",
  "AGENTS.md": "AGENTS.md line",
  skill: "Skill",
} as const;
export type FixLevel = keyof typeof FIX_LEVELS;

// One entry of library.json. scripts/schemas/library.schema.json is the source of truth.
export type LibraryEntry = {
  pr: number;
  name: string;
  kind: "skill" | "fix";
  fixLevel: FixLevel | null;
  catches: string;
  toolsPassed: string[];
  state: "open" | "merged";
  openedAt: string;
};
export type LibraryDoc = {
  schemaVersion: 1;
  updatedAt: string;
  entries: LibraryEntry[];
};

export type LibraryRow = {
  pr: number;
  name: string;
  fixLevel: string;
  catches: string;
  // A skill: every tool, lit when all its should-fire prompts passed. A fix has no trigger tests: null.
  tools: { name: string; passed: boolean }[] | null;
  state: "open" | "merged";
};
export type LibraryList = { rows: LibraryRow[]; updated: string };

const isString = (value: unknown): value is string => typeof value === "string";

function isEntry(value: unknown): value is LibraryEntry {
  const e = value as Partial<LibraryEntry> | null;
  return (
    typeof e === "object" &&
    e !== null &&
    Number.isInteger(e.pr) &&
    isString(e.name) &&
    (e.kind === "skill" || e.kind === "fix") &&
    (e.fixLevel === null ||
      (isString(e.fixLevel) && e.fixLevel in FIX_LEVELS)) &&
    isString(e.catches) &&
    Array.isArray(e.toolsPassed) &&
    e.toolsPassed.every(isString) &&
    (e.state === "open" || e.state === "merged")
  );
}

export function toolsOf(passed: string[]): { name: string; passed: boolean }[] {
  const known: readonly string[] = TOOLS;
  const others = passed.filter((tool) => !known.includes(tool));
  return [...known, ...others].map((name) => ({
    name,
    passed: passed.includes(name),
  }));
}

export function libraryList(doc: unknown): LibraryList {
  const library = doc as Partial<LibraryDoc> | null | undefined;
  const entries = Array.isArray(library?.entries)
    ? library.entries.filter(isEntry)
    : [];
  return {
    rows: [...entries]
      .sort((a, b) => a.pr - b.pr)
      .map((entry) => ({
        pr: entry.pr,
        name: entry.name,
        fixLevel: entry.fixLevel ? FIX_LEVELS[entry.fixLevel] : "—",
        catches: entry.catches,
        tools: entry.kind === "skill" ? toolsOf(entry.toolsPassed) : null,
        state: entry.state,
      })),
    updated: isString(library?.updatedAt)
      ? `updated ${hhmm(library.updatedAt)}`
      : "",
  };
}
