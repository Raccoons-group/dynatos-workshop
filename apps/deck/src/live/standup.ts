// The stand-up card: one group's mini ribbon, enlarged, with what its three minutes are about. The route it took
// (slices, acceptance examples), the first green CI, the skills it wrote, and what the agent got wrong.

import { examplesOf, type AcceptanceExample } from "./fog";
import { groupLabel, hhmm } from "./format";
import type { Observation, Phase } from "./types";
import { groupsOf, stationsOf, threadsOf, type WallCard } from "./wall";

export type StandupCard = {
  group: string;
  label: string;
  phase: Phase;
  stations: WallCard["stations"];
  gatePassed: boolean;
  threads: WallCard["threads"];
  slices: { name: string; status: "planned" | "building" | "shipped" }[];
  examples: AcceptanceExample[];
  // Counted from the lists above, so the numbers can never disagree with what the card lists.
  shipped: string;
  covered: string;
  firstGreen: string | null;
  skillsWritten: string[];
  agentGotWrong: { item: string; twice: boolean }[];
};

const ofTotal = (part: number, whole: number, what: string) =>
  whole === 0 ? "none yet" : `${part} of ${whole} ${what}`;

// Null for the demo, or for a group that hasn't opened its draft PR.
export function standupCard(
  observations: Observation[],
  group: string,
): StandupCard | null {
  const o = groupsOf(observations).find((g) => g.group === group);
  if (!o) return null;
  const slices = o.judgements.slices.map(({ name, status }) => ({
    name,
    status,
  }));
  const examples = examplesOf(o);
  return {
    group: o.group,
    label: groupLabel(o.group),
    phase: o.facts.phase,
    stations: stationsOf(o.facts.phase),
    gatePassed: o.facts.specReviewedAt !== null,
    threads: threadsOf(o),
    slices,
    examples,
    shipped: ofTotal(
      slices.filter((s) => s.status === "shipped").length,
      slices.length,
      "shipped",
    ),
    covered: ofTotal(
      examples.filter((e) => e.inTest).length,
      examples.length,
      "in tests",
    ),
    firstGreen: o.facts.firstGreenAt ? hhmm(o.facts.firstGreenAt) : null,
    skillsWritten: [...o.facts.skillsWritten],
    agentGotWrong: o.judgements.agentGotWrong.map(({ item, twice }) => ({
      item,
      twice,
    })),
  };
}
