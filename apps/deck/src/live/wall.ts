// What the wall shows for each group: a mini ribbon (the phase along the top, the threads underneath), the CI
// badge, what the group is doing, and how fresh that is. Pure functions, so the view stays a template.

import { DEMO_GROUP, groupLabel, hhmm } from "./format";
import type { Observation, Phase } from "./types";

// The stations a group passes during group work, in order. Read happens in the talk, Learn on Day 2.
export const STATIONS = [
  "Explore",
  "Specify",
  "Slice",
  "Build",
  "Review",
  "Ship",
] as const;
export type Station = (typeof STATIONS)[number];

const STATION_OF: Record<Phase, Station> = {
  Exploring: "Explore",
  Specifying: "Specify",
  "Spec reviewed": "Specify",
  Slicing: "Slice",
  Building: "Build",
  Reviewing: "Review",
  "PR ready": "Ship",
};

export type Threads = { context: boolean; skills: boolean; checks: boolean };

export type WallCard = {
  group: string;
  label: string;
  stations: { name: Station; state: "done" | "current" | "todo" }[];
  // The spec review checkpoint sits between Specify and Slice. A group can build before passing it; the wall shows that.
  gatePassed: boolean;
  threads: Threads;
  ci: "pass" | "fail" | "cancelled" | "none";
  now: string;
  notable: string;
  firstGreen: string | null;
  fresh: { stale: boolean; text: string };
};

// The bottom row of the ribbon. Each thread lights from facts the scripts counted, never from the model.
export function threadsOf(o: Observation): Threads {
  const { agentsMd, glossary } = o.facts.artifacts;
  return {
    // Context: case/AGENTS.md has grown past the stub open-pr commits, and the glossary exists.
    context:
      agentsMd.present &&
      agentsMd.lastChangedAt !== agentsMd.firstSeenAt &&
      glossary.present,
    // Skills: the group wrote a skill, or ran the review skill.
    skills: o.facts.skillsWritten.length > 0 || o.facts.review.rounds > 0,
    // Checks: tests were added and CI is green.
    checks: o.facts.testsAdded.length > 0 && o.facts.ci?.result === "pass",
  };
}

export function stationsOf(phase: Phase): WallCard["stations"] {
  const current = STATIONS.indexOf(STATION_OF[phase]);
  return STATIONS.map((name, i) => ({
    name,
    state: i < current ? "done" : i === current ? "current" : "todo",
  }));
}

// Every view except the talk slides' demo card shows the groups only, always in the same order.
export function groupsOf(observations: Observation[]): Observation[] {
  return observations
    .filter((o) => o.group !== DEMO_GROUP)
    .sort((a, b) => a.group.localeCompare(b.group));
}

export type Freshness = { now?: Date; staleAfterMinutes?: number };

export function wallCard(
  o: Observation,
  { now = new Date(), staleAfterMinutes = 40 }: Freshness = {},
): WallCard {
  const minutesSincePush =
    (now.getTime() - new Date(o.facts.lastPushAt).getTime()) / 60_000;
  const stale = minutesSincePush > staleAfterMinutes;
  return {
    group: o.group,
    label: groupLabel(o.group),
    stations: stationsOf(o.facts.phase),
    gatePassed: o.facts.specReviewedAt !== null,
    threads: threadsOf(o),
    ci: o.facts.ci?.result ?? "none",
    now: o.judgements.now,
    notable: o.judgements.notable,
    firstGreen: o.facts.firstGreenAt ? hhmm(o.facts.firstGreenAt) : null,
    fresh: {
      stale,
      text: `${stale ? "stale since" : "updated"} ${hhmm(o.facts.lastPushAt)}`,
    },
  };
}

export function wallCards(
  observations: Observation[],
  freshness: Freshness = {},
): WallCard[] {
  return groupsOf(observations).map((o) => wallCard(o, freshness));
}

// The demo's card, for the talk slides only. Null until the demo's draft PR has been observed.
export function demoCard(
  observations: Observation[],
  freshness: Freshness = {},
): WallCard | null {
  const demo = observations.find((o) => o.group === DEMO_GROUP);
  return demo ? wallCard(demo, freshness) : null;
}
