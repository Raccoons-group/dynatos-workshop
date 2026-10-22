// The Day 2 retrospective views, from retrospective.json: how it was made, the three routes, "Is this you?", the
// decision grid revisited, how each group drove its agent, where the agent went wrong, and the "wrong twice"
// shortlist. Groups always in the same order, the demo never, and no view ranks or contrasts them.
//
// A claim shows where it comes from (a file, a commit, a CI run, the coaches' log) and how sure the synthesis is,
// but never its quote: a quote from a group's note can name a person. Pure functions, so the views stay templates.

import { DEMO_GROUP, groupLabel, hhmm, WORKSHOP_TIME_ZONE } from "./format";
import type {
  Claim,
  Confidence,
  RetroEvidence,
  Retrospective,
} from "./retrospective";
import { DECISIONS, type Call, type DecisionKey } from "./types";
import { STATIONS, type Station } from "./wall";

// A coach corrects the file by hand before 09:00, so read it defensively.
export function retrospectiveOf(doc: unknown): Retrospective | null {
  const r = doc as Partial<Retrospective> | null | undefined;
  return r && typeof r === "object" && r.schemaVersion === 1
    ? (r as Retrospective)
    : null;
}

const list = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

function byGroup<T extends { group: string }>(items: T[]): T[] {
  return list(items)
    .filter((item) => item.group !== DEMO_GROUP)
    .sort((a, b) => a.group.localeCompare(b.group));
}

export type Provenance = { sources: string[]; confidence: Confidence };

export function sourceOf(e: RetroEvidence): string {
  switch (e.kind) {
    case "file":
      return e.file;
    case "commit":
      return `commit ${e.sha.slice(0, 7)}`;
    case "ci":
      return `CI ${e.result} ${hhmm(e.at)}`;
    default:
      return "coach observation";
  }
}

export function provenance(claim: Claim): Provenance {
  return {
    sources: [...new Set(list(claim.evidence).map(sourceOf))],
    confidence: claim.confidence,
  };
}

// 1. How this was made.
const SOURCE_KINDS: Record<string, string> = {
  git: "Git history",
  "pr-timeline": "PR timelines",
  "working-out": "Working-out",
  observations: "The live deck's observations",
  "coach-log": "The coaches' log",
};

export type HowMade = {
  status: string;
  sources: { kind: string; note: string }[];
  claims: { confidence: Confidence; count: number }[];
};

export function howThisWasMade(doc: unknown): HowMade | null {
  const r = retrospectiveOf(doc);
  if (!r) return null;
  const confidences: Confidence[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      const claim = value as Partial<Claim>;
      if (claim.confidence && Array.isArray(claim.evidence))
        confidences.push(claim.confidence);
      Object.values(value).forEach(walk);
    }
  };
  walk({ ...r, signals: null });
  return {
    status:
      r.status === "reviewed"
        ? `reviewed by the coaches, ${hhmm(r.updatedAt)}`
        : r.status === "draft"
          ? "a draft the coaches are still reviewing"
          : "the team signals only, so far",
    sources: list(r.sources).map((s) => ({
      kind: SOURCE_KINDS[s.kind] ?? s.kind,
      note: s.note,
    })),
    claims: (["high", "medium", "low"] as const).map((confidence) => ({
      confidence,
      count: confidences.filter((c) => c === confidence).length,
    })),
  };
}

// 2. Three routes: a swimlane per group over the afternoon, from the kickoff to the stand-up.
const minutesOf = (() => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: WORKSHOP_TIME_ZONE,
  });
  return (iso: string) => {
    const [h, m] = parts.format(new Date(iso)).split(":").map(Number);
    return h! * 60 + m!;
  };
})();
const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const toMinutes = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h! * 60 + m!;
};

export type Lane = {
  group: string;
  label: string;
  segments: (Provenance & {
    station: Station;
    text: string;
    left: number;
    width: number;
  })[];
  gate: { at: string; left: number } | null;
};
export type Routes = {
  lanes: Lane[];
  ticks: { label: string; left: number }[];
  lunch: { left: number; width: number };
};

export function routeLanes(
  doc: unknown,
  { from = "11:10", to = "16:45", lunch = { from: "12:40", to: "14:05" } } = {},
): Routes | null {
  const r = retrospectiveOf(doc);
  if (!r) return null;
  const start = toMinutes(from);
  const end = toMinutes(to);
  const at = (minutes: number) =>
    ((Math.min(Math.max(minutes, start), end) - start) / (end - start)) * 100;
  const labelled = new Map(
    list(r.signals?.groups).map((g) => [g.group, g.timeToSpec.labelledAt]),
  );
  return {
    lanes: byGroup(r.routes).map((route) => {
      const label = labelled.get(route.group);
      return {
        group: route.group,
        label: groupLabel(route.group),
        segments: list(route.segments).map((s) => {
          const a = minutesOf(s.from);
          const b = s.to ? minutesOf(s.to) : end;
          return {
            station: s.station,
            text: `${hhmm(s.from)}–${s.to ? hhmm(s.to) : ""}`,
            left: at(a),
            width: Math.max(at(b) - at(a), 0.5),
            ...provenance(s),
          };
        }),
        gate: label ? { at: hhmm(label), left: at(minutesOf(label)) } : null,
      };
    }),
    ticks: Array.from(
      { length: Math.floor(end / 60) - Math.ceil(start / 60) + 1 },
      (_, i) => (Math.ceil(start / 60) + i) * 60,
    ).map((m) => ({ label: clock(m), left: at(m) })),
    lunch: {
      left: at(toMinutes(lunch.from)),
      width: at(toMinutes(lunch.to)) - at(toMinutes(lunch.from)),
    },
  };
}

// 3. Is this you? One claim per group: the one the synthesis is least sure of.
const SURE: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };

export type IsThisYouCard = Provenance & {
  group: string;
  label: string;
  claim: string;
  correction: string | null;
};

export function isThisYouCards(doc: unknown): IsThisYouCard[] {
  const r = retrospectiveOf(doc);
  if (!r) return [];
  const least = new Map<string, Retrospective["isThisYou"][number]>();
  for (const item of byGroup(r.isThisYou)) {
    const current = least.get(item.group);
    if (!current || SURE[item.confidence] < SURE[current.confidence])
      least.set(item.group, item);
  }
  return [...least.values()].map((item) => ({
    group: item.group,
    label: groupLabel(item.group),
    claim: item.claim,
    correction: item.correction,
    ...provenance(item),
  }));
}

// 4. The decision grid revisited: each final call, and the rework a call caused after the checkpoint.
export type RevisitedGrid = {
  columns: { group: string; label: string }[];
  rows: {
    key: DecisionKey;
    title: string;
    cells: (Provenance & {
      group: string;
      call: Call;
      line: string;
      rework: string | null;
    })[];
  }[];
};

export function decisionsRevisited(doc: unknown): RevisitedGrid | null {
  const r = retrospectiveOf(doc);
  if (!r) return null;
  const groups = byGroup(r.decisions).filter((d) => d.calls);
  return {
    columns: groups.map((d) => ({
      group: d.group,
      label: groupLabel(d.group),
    })),
    rows: DECISIONS.map(([key, title]) => ({
      key,
      title,
      cells: groups.map((d) => {
        const c = d.calls[key];
        return c
          ? {
              group: d.group,
              call: c.call,
              line: c.line,
              rework: c.rework,
              ...provenance(c),
            }
          : {
              group: d.group,
              call: "open" as Call,
              line: "",
              rework: null,
              sources: [],
              confidence: "low" as Confidence,
            };
      }),
    })),
  };
}

// 6. How each group drove its agent. Side by side, never contrasted.
const TESTS: Record<string, string> = {
  before: "Tests before the code",
  after: "Tests after the code",
  mixed: "Tests before and after, by slice",
  unknown: "Test order not clear",
};

export type DrivingColumn = {
  group: string;
  label: string;
  tool: string;
  tests: string;
  skills: string[];
  corrections: string[];
  steering: string | null;
  said: string[];
  anecdotes: string[];
};

export function drivingColumns(doc: unknown): DrivingColumn[] {
  const r = retrospectiveOf(doc);
  if (!r) return [];
  return byGroup(r.driving).map((d) => ({
    group: d.group,
    label: groupLabel(d.group),
    tool: d.tool,
    tests: TESTS[d.tests?.order] ?? TESTS.unknown!,
    skills: list(d.skillsFired).map((s) => s.skill),
    corrections: list(d.corrections).map((c) => c.text),
    steering: d.steering?.text ?? null,
    said: list(d.saidByTheGroup).map((s) => s.text),
    anecdotes: list(d.anecdotes).map((a) => a.text),
  }));
}

// 7. Where the agent went wrong: each mistake on the station where it started.
const ORIGINS: Record<string, string> = {
  context: "missing context",
  spec: "a gap in the spec",
  check: "a missing check",
  review: "review missed it",
};

export type StationMistakes = {
  station: Station;
  mistakes: (Provenance & {
    label: string;
    text: string;
    origin: string;
    repeated: boolean;
  })[];
};

export function mistakesOnStations(doc: unknown): StationMistakes[] {
  const r = retrospectiveOf(doc);
  if (!r) return [];
  const mistakes = byGroup(r.mistakes);
  return STATIONS.map((station) => ({
    station,
    mistakes: mistakes
      .filter((m) => m.station === station)
      .map((m) => ({
        label: groupLabel(m.group),
        text: m.text,
        origin: ORIGINS[m.origin] ?? m.origin,
        repeated: m.repeated,
        ...provenance(m),
      })),
  }));
}

// 8. The hand-off: what went wrong twice, by the thread where a fix could live. No suggested actions.
export const THREADS = [
  ["context", "Context", "a line in AGENTS.md or the glossary"],
  ["skills", "Skills", "a skill"],
  ["checks", "Checks", "a test, lint or CI check"],
] as const;

export type ShortlistColumn = {
  thread: string;
  title: string;
  where: string;
  items: (Provenance & { item: string; groups: string[] })[];
};

export function shortlistByThread(doc: unknown): ShortlistColumn[] {
  const r = retrospectiveOf(doc);
  if (!r) return [];
  return THREADS.map(([thread, title, where]) => ({
    thread,
    title,
    where,
    items: list(r.shortlist)
      .filter((s) => s.thread === thread)
      .map((s) => ({
        item: s.item,
        groups: list(s.groups)
          .filter((g) => g !== DEMO_GROUP)
          .sort()
          .map(groupLabel),
        ...provenance(s),
      })),
  }));
}
