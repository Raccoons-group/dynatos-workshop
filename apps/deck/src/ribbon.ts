// The ribbon, the deck's one frame: eight stations along the top, each committing an artifact, and three threads
// along the bottom that the feature carries the whole way. Static, unlike the wall's mini ribbons.

export const RIBBON = [
  { station: "Read", artifact: "the issue, said back" },
  { station: "Explore", artifact: "the grill and glossary" },
  { station: "Specify", artifact: "spec.md" },
  { station: "Slice", artifact: "issues/" },
  { station: "Build", artifact: "code and tests" },
  { station: "Review", artifact: "review.md" },
  { station: "Ship", artifact: "the PR with evidence" },
  { station: "Learn", artifact: "a check, skill or AGENTS.md line" },
] as const;

export const THREADS = [
  { thread: "Context", role: "steers the agent", taught: "before the ticket" },
  {
    thread: "Skills",
    role: "steers the agent",
    taught: "after the first skill runs",
  },
  { thread: "Checks", role: "catches the agent", taught: "in Part 2" },
] as const;

// The gates every group passes, on the station where each one sits. Everything else is the group's call.
export const FIXED_GATES: Record<string, string> = {
  Specify: "draft PR within 30 min",
  Build: "slice 1 green in CI",
  Review: "another group's tool, at most 3 rounds",
  Ship: "how-we-worked before every push, merge before the stand-up",
};

// The everyday toolkit on each station (slide 27). The skills exhibit lights each one once its folder exists.
export const STATION_SKILLS: [string, string[]][] = [
  ["Read", ["read-issue"]],
  ["Explore", ["grill-with-docs"]],
  ["Specify", ["to-spec"]],
  ["Slice", ["to-tickets"]],
  ["Build", ["implement", "tdd"]],
  ["Review", ["code-review"]],
  ["Ship", ["open-pr"]],
  ["Learn", ["how-we-worked"]],
];

// The day and a half, drawn over the stations (slide 7).
export const AGENDA_BANDS = [
  { label: "Part 1 · the demo", from: 0, to: 3, when: "09:40" },
  { label: "Your morning", from: 1, to: 2, when: "11:10" },
  { label: "Part 2 · the demo", from: 4, to: 7, when: "13:30" },
  { label: "Your afternoon", from: 3, to: 6, when: "14:05" },
  { label: "Day 2: retro, lab, plan", from: 7, to: 7, when: "09:00" },
] as const;
