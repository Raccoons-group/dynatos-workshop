// "Tonight": per group, the last push and the working-out checklist, so each group pushes what's missing before
// the merge. The checklist reads files the scripts found, never the PR's ticked boxes.

import { groupLabel, hhmm } from "./format";
import type { Observation } from "./types";
import { groupsOf } from "./wall";

export const CHECKLIST = [
  ["agentsMd", "AGENTS.md"],
  ["glossary", "Glossary"],
  ["spec", "Spec"],
  ["tickets", "Tickets"],
  ["review", "Review"],
  ["howWeWorked", "How-we-worked"],
] as const;

export type TonightRow = {
  group: string;
  label: string;
  lastPush: string;
  items: { name: string; done: boolean }[];
};

export function tonightRows(observations: Observation[]): TonightRow[] {
  return groupsOf(observations).map((o) => {
    const { artifacts } = o.facts;
    // open-pr commits the AGENTS.md stub, so that item is done only once the file has changed since.
    const agentsMdGrown =
      artifacts.agentsMd.present &&
      artifacts.agentsMd.lastChangedAt !== artifacts.agentsMd.firstSeenAt;
    return {
      group: o.group,
      label: groupLabel(o.group),
      lastPush: hhmm(o.facts.lastPushAt),
      items: CHECKLIST.map(([key, name]) => ({
        name,
        done: key === "agentsMd" ? agentsMdGrown : artifacts[key].present,
      })),
    };
  });
}
