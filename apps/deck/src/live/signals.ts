// "Team signals, not volume": the five signals as rows and one fixed column per group, for the Day 2 retrospective.
// The numbers come from scripts/team-signals.mjs and the deck counts its lists. There are no totals and no colour
// scale: nothing adds up across groups or slices, and every cell reads the same way. Pure functions, so the view
// stays a template.

import { DEMO_GROUP, groupLabel, hhmm } from "./format";
import type {
  CiRun,
  GroupSignals,
  Retrospective,
  TeamSignals,
} from "./retrospective";

// The order the signals are shown in, always.
export const SIGNALS = [
  ["timeToSpec", "Time from intent to spec"],
  ["specRework", "Spec rework"],
  ["firstPassCi", "First-pass CI"],
  ["reviewRounds", "Review rounds"],
  ["drift", "Drift between plan and diff"],
] as const;
export type SignalKey = (typeof SIGNALS)[number][0];

export type SignalCell = { group: string; value: string; lines: string[] };
export type SignalRow = {
  key: SignalKey;
  title: string;
  definition: string;
  cells: SignalCell[];
};
export type SignalsGrid = {
  columns: { group: string; label: string }[];
  rows: SignalRow[];
};

// How many changed files a cell lists by name before it says how many more there are.
const FILES_SHOWN = 3;

// A coach corrects the retrospective by hand before 09:00, so read it defensively: a missing list is an empty one.
const list = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];
const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

export function signalsOf(retrospective: unknown): TeamSignals | null {
  const signals = (retrospective as Partial<Retrospective> | null | undefined)
    ?.signals;
  return signals && Array.isArray(signals.groups) ? signals : null;
}

// "2 red, then green", "green first time", "1 red, not green yet". Red means every run before the first green.
export function firstPass(runs: CiRun[]): string {
  if (!runs.length) return "no run on its code yet";
  const firstGreen = runs.findIndex((run) => run.result === "pass");
  const red = (firstGreen === -1 ? runs : runs.slice(0, firstGreen)).length;
  if (firstGreen === -1) return `${red} red, not green yet`;
  return red === 0 ? "green first time" : `${red} red, then green`;
}

// "01-start-a-group-order.md" and "Start a group order" → "01 Start a group order".
function sliceName(ticket: string | null, title: string | null): string {
  const number = /^\d+/.exec(ticket ?? "")?.[0];
  return [number, title ?? ticket].filter(Boolean).join(" ");
}

function cellsFor(key: SignalKey, g: GroupSignals): Omit<SignalCell, "group"> {
  const labelledAt = g.timeToSpec?.labelledAt ?? null;
  switch (key) {
    case "timeToSpec":
      return labelledAt === null
        ? { value: "no checkpoint", lines: [] }
        : {
            value: `${g.timeToSpec.minutes ?? "?"} min`,
            lines: [`label at ${hhmm(labelledAt)}`],
          };
    case "specRework": {
      const changes = list(g.specRework?.changes);
      if (labelledAt === null) return { value: "no checkpoint", lines: [] };
      return changes.length
        ? {
            value: `${plural(changes.length, "change")} after the label`,
            lines: [changes.map((change) => hhmm(change.at)).join(", ")],
          }
        : { value: "no changes after the label", lines: [] };
    }
    case "firstPassCi": {
      const slices = list(g.firstPassCi?.slices);
      const [only] = slices;
      if (!only) return { value: "no slices", lines: [] };
      if (slices.length === 1 && only.ticket === null)
        return {
          value: "slices not tracked",
          lines: [firstPass(list(only.runs))],
        };
      return {
        value: "",
        lines: slices.map(
          (slice) =>
            `${sliceName(slice.ticket, slice.title)}: ${firstPass(list(slice.runs))}`,
        ),
      };
    }
    case "reviewRounds": {
      const rounds = g.reviewRounds?.rounds ?? 0;
      return {
        value: rounds ? plural(rounds, "round") : "not reviewed",
        lines: [],
      };
    }
    case "drift": {
      const outside = list(g.drift?.outsidePlan);
      const added = list(g.drift?.added).length;
      const dropped = list(g.drift?.dropped).length;
      return {
        value: `${list(g.drift?.planned).length} planned · ${list(g.drift?.shipped).length} shipped`,
        lines: [
          ...(added ? [`${added} added later`] : []),
          ...(dropped ? [`${dropped} dropped`] : []),
          outside.length
            ? `${plural(outside.length, "file")} outside the plan`
            : "no files outside the plan",
          ...outside.slice(0, FILES_SHOWN),
          ...(outside.length > FILES_SHOWN
            ? [`and ${outside.length - FILES_SHOWN} more`]
            : []),
        ],
      };
    }
  }
}

export function signalsGrid(retrospective: unknown): SignalsGrid {
  const signals = signalsOf(retrospective);
  if (!signals) return { columns: [], rows: [] };
  const groups = signals.groups
    .filter((g) => g && typeof g.group === "string" && g.group !== DEMO_GROUP)
    .sort((a, b) => a.group.localeCompare(b.group));
  const lunch = signals.lunch
    ? ` (${signals.lunch.from}–${signals.lunch.to})`
    : "";
  const definitions: Record<SignalKey, string> = {
    timeToSpec: `working minutes from ${signals.kickoff ?? "the kickoff"} to the spec-reviewed label, without lunch${lunch}`,
    specRework: "spec changes after the label",
    firstPassCi: "red runs before the first green, per slice",
    reviewRounds: "rounds in review.md",
    drift: "slices planned vs shipped, and files changed outside the plan",
  };
  return {
    columns: groups.map((g) => ({
      group: g.group,
      label: groupLabel(g.group),
    })),
    rows: SIGNALS.map(([key, title]) => ({
      key,
      title,
      definition: definitions[key],
      cells: groups.map((g) => ({ group: g.group, ...cellsFor(key, g) })),
    })),
  };
}
