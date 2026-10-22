// The repo's PR list (slide 6) and the footer's "last update from GitHub", from the JSON the sync script writes
// next to the data branch.

import { hhmm } from "./format";
import type { LiveMeta } from "./types";

export type PrRow = {
  number: number;
  title: string;
  state: "draft" | "open" | "merged" | "closed";
  base: string;
};

export function prRows(meta: LiveMeta | null, limit = 9): PrRow[] {
  return [...(meta?.prs ?? [])]
    .sort((a, b) => b.number - a.number)
    .slice(0, limit)
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      state:
        pr.state === "MERGED"
          ? "merged"
          : pr.state === "CLOSED"
            ? "closed"
            : pr.isDraft
              ? "draft"
              : "open",
      base: pr.baseRefName,
    }));
}

export function lastUpdate(meta: LiveMeta | null): string {
  if (!meta?.lastFetchAt) return "not synced with GitHub yet";
  const text = `last update from GitHub ${hhmm(meta.lastFetchAt)}`;
  return meta.lastFetchError ? `offline · ${text}` : text;
}
