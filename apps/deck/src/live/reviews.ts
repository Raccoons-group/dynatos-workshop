// "What the reviewers found": per group, how many rounds another group's tool ran, its findings per bucket, the
// headline finding and CI. The bucket counts come from review.md through the scripts, never from the model.

import { groupLabel } from "./format";
import type { Observation } from "./types";
import { groupsOf, type WallCard } from "./wall";

// The buckets from REVIEW.md, in its order.
export const BUCKETS = [
  ["actOn", "Act on"],
  ["consider", "Consider"],
  ["noted", "Noted"],
  ["dismissed", "Dismissed"],
] as const;

export type ReviewCard = {
  group: string;
  label: string;
  rounds: string;
  // No buckets until a first round has landed in review.md. Deliberately no total across them.
  buckets: { name: string; count: number }[];
  headline: string | null;
  ci: WallCard["ci"];
};

export function reviewCards(observations: Observation[]): ReviewCard[] {
  return groupsOf(observations).map((o) => {
    const { rounds, findings } = o.facts.review;
    return {
      group: o.group,
      label: groupLabel(o.group),
      rounds:
        rounds === 0
          ? "not reviewed yet"
          : `${rounds} ${rounds === 1 ? "round" : "rounds"}`,
      buckets:
        rounds === 0
          ? []
          : BUCKETS.map(([key, name]) => ({ name, count: findings[key] })),
      headline: o.judgements.reviewHeadline,
      ci: o.facts.ci?.result ?? "none",
    };
  });
}
