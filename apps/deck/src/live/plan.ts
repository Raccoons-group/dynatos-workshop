// The action-plan grid for Day 2: the four rows, each with its quick-win and longer-step candidates, filling in as
// the coach merges each group's row draft. After the vote, the winners stand out. It reads action-plan.json, which
// scripts/action-plan.mjs builds from docs/action-plan/ on main. The plugin only checks that the file parses, so
// anything that isn't the expected shape is left out. The README's owners never reach this file.

import { groupLabel, hhmm } from "./format";

export const PLAN_ROWS = [
  ["route", "Route"],
  ["context", "Context"],
  ["skills", "Skills"],
  ["checks", "Checks"],
] as const;
export type Thread = (typeof PLAN_ROWS)[number][0];

// action-plan.json. scripts/schemas/action-plan.schema.json is the source of truth.
export type PlanCandidateDoc = { item: string; why: string };
export type PlanRowDoc = {
  thread: Thread;
  draftedBy: string | null;
  quickWins: PlanCandidateDoc[];
  longerSteps: PlanCandidateDoc[];
  chosen: { quickWin: string | null; longerStep: string | null };
};
export type PlanDoc = {
  schemaVersion: 1;
  updatedAt: string;
  rows: PlanRowDoc[];
};

export type PlanCandidate = { item: string; why: string; chosen: boolean };
export type PlanRow = {
  thread: Thread;
  label: string;
  // "Group A", or null for the route row the room writes with a coach.
  draftedBy: string | null;
  filled: boolean;
  quickWins: PlanCandidate[];
  longerSteps: PlanCandidate[];
};
export type PlanGrid = { rows: PlanRow[]; voted: boolean; updated: string };

const isString = (value: unknown): value is string => typeof value === "string";
const isCandidate = (value: unknown): value is PlanCandidateDoc =>
  typeof value === "object" &&
  value !== null &&
  isString((value as PlanCandidateDoc).item) &&
  isString((value as PlanCandidateDoc).why);
const candidatesOf = (value: unknown): PlanCandidateDoc[] =>
  Array.isArray(value) ? value.filter(isCandidate) : [];

const normal = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\s.:;,]+/g, " ")
    .trim();

// Marks the vote's winner among the candidates. A coach may type it a little differently in the README, so a
// winner that contains a candidate (or the other way round) counts; one that matches none is added as typed.
export function withWinner(
  candidates: PlanCandidateDoc[],
  winner: string | null,
): PlanCandidate[] {
  const won = winner ? normal(winner) : null;
  const marked = candidates.map((c) => {
    const item = normal(c.item);
    return {
      ...c,
      chosen: Boolean(
        won && item && (won.includes(item) || item.includes(won)),
      ),
    };
  });
  if (winner && !marked.some((c) => c.chosen))
    marked.push({ item: winner, why: "", chosen: true });
  return marked;
}

export function planGrid(doc: unknown): PlanGrid {
  const plan = doc as Partial<PlanDoc> | null | undefined;
  const docs = Array.isArray(plan?.rows) ? plan.rows : [];
  const rows = PLAN_ROWS.map(([thread, label]): PlanRow => {
    const row = docs.find(
      (r): r is PlanRowDoc =>
        typeof r === "object" && r !== null && r.thread === thread,
    );
    const chosen = row?.chosen ?? { quickWin: null, longerStep: null };
    const quickWins = withWinner(
      candidatesOf(row?.quickWins),
      isString(chosen.quickWin) ? chosen.quickWin : null,
    );
    const longerSteps = withWinner(
      candidatesOf(row?.longerSteps),
      isString(chosen.longerStep) ? chosen.longerStep : null,
    );
    const group =
      isString(row?.draftedBy) && /^group-[a-z0-9]+$/.test(row.draftedBy)
        ? row.draftedBy
        : null;
    return {
      thread,
      label,
      draftedBy: group ? groupLabel(group) : null,
      filled: quickWins.length + longerSteps.length > 0,
      quickWins,
      longerSteps,
    };
  });
  return {
    rows,
    voted: rows.some((row) =>
      [...row.quickWins, ...row.longerSteps].some((c) => c.chosen),
    ),
    updated: isString(plan?.updatedAt) ? `updated ${hhmm(plan.updatedAt)}` : "",
  };
}
