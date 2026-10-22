import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

import { loadSchema, validate } from "../../../scripts/lib/schema.mjs";
import { createLiveReader } from "../src/live/plugin";
import type { GroupSignals, Retrospective } from "../src/live/retrospective";
import { firstPass, SIGNALS, signalsGrid } from "../src/live/signals";
import { FIXTURES_DIR } from "./fixtures";

// The same file the scripts' tests validate: scripts/test/fixtures/retrospective.json.
const RETROSPECTIVE = join(FIXTURES_DIR, "..", "retrospective.json");
const retrospective = (): Retrospective =>
  JSON.parse(readFileSync(RETROSPECTIVE, "utf8")) as Retrospective;

// The demo never shows in a retrospective view, and the groups never move, whatever order the file has.
const shuffled = () => {
  const doc = retrospective();
  const [a, b, c] = doc.signals!.groups as [
    GroupSignals,
    GroupSignals,
    GroupSignals,
  ];
  doc.signals!.groups = [c, { ...a, group: "demo" }, a, b];
  return doc;
};

const cell = (key: string, group: string) =>
  signalsGrid(retrospective())
    .rows.find((row) => row.key === key)!
    .cells.find((c) => c.group === group)!;

test("the fixture matches the retrospective schema", () => {
  const schema = loadSchema(
    join(
      FIXTURES_DIR,
      "../../../../.claude/skills/retrospective/retrospective.schema.json",
    ),
  );
  expect(validate(schema, retrospective())).toEqual([]);
});

test("groups sit in fixed columns, with the demo left out", () => {
  const grid = signalsGrid(shuffled());

  expect(grid.columns).toEqual([
    { group: "group-a", label: "Group A" },
    { group: "group-b", label: "Group B" },
    { group: "group-c", label: "Group C" },
  ]);
  for (const row of grid.rows)
    expect(row.cells.map((c) => c.group)).toEqual([
      "group-a",
      "group-b",
      "group-c",
    ]);
});

test("the five signals come in their fixed order, with no totals anywhere", () => {
  const grid = signalsGrid(shuffled());

  expect(grid.rows.map((row) => row.title)).toEqual(
    SIGNALS.map(([, title]) => title),
  );
  expect(grid.columns).toHaveLength(3);
  expect(JSON.stringify(grid)).not.toMatch(/total|sum|average|rank/i);
  expect(grid.rows[0]?.definition).toBe(
    "working minutes from 11:10 to the spec-reviewed label, without lunch (12:40–14:05)",
  );
});

test("time from intent to spec and spec rework, or no checkpoint", () => {
  expect(cell("timeToSpec", "group-a")).toEqual({
    group: "group-a",
    value: "120 min",
    lines: ["label at 14:35"],
  });
  expect(cell("timeToSpec", "group-c").value).toBe("no checkpoint");

  expect(cell("specRework", "group-a")).toEqual({
    group: "group-a",
    value: "1 change after the label",
    lines: ["15:20"],
  });
  expect(cell("specRework", "group-b").value).toBe(
    "no changes after the label",
  );
  expect(cell("specRework", "group-c").value).toBe("no checkpoint");
});

test("first-pass CI per slice, counted from the runs", () => {
  expect(cell("firstPassCi", "group-a").lines).toEqual([
    "01 Start a group order and join with a code: 2 red, then green",
    "02 Close the order at the deadline: green first time",
    "03 The host places it as one order: no run on its code yet",
  ]);
  expect(cell("firstPassCi", "group-b")).toEqual({
    group: "group-b",
    value: "slices not tracked",
    lines: ["1 red, then green"],
  });
  expect(cell("firstPassCi", "group-c").value).toBe("no slices");

  const red = { sha: "a4a4a4a", at: "2026-10-27T15:02:00+01:00" } as const;
  expect(
    firstPass([
      { ...red, result: "fail" },
      { ...red, result: "fail" },
    ]),
  ).toBe("2 red, not green yet");
});

test("review rounds and drift between plan and diff", () => {
  expect(cell("reviewRounds", "group-a").value).toBe("2 rounds");
  expect(cell("reviewRounds", "group-b").value).toBe("1 round");
  expect(cell("reviewRounds", "group-c").value).toBe("not reviewed");

  expect(cell("drift", "group-a")).toEqual({
    group: "group-a",
    value: "3 planned · 2 shipped",
    lines: ["1 file outside the plan", "case/api/Program.cs"],
  });
  expect(cell("drift", "group-b")).toEqual({
    group: "group-b",
    value: "2 planned · 0 shipped",
    lines: [
      "1 added later",
      "1 dropped",
      "5 files outside the plan",
      ".github/workflows/tests.yml",
      "case/api/Program.cs",
      "case/web/src/App.tsx",
      "and 2 more",
    ],
  });
  expect(cell("drift", "group-c").lines).toEqual(["no files outside the plan"]);
});

test("before the overnight run, or with a hand-broken file, it shows what it can", () => {
  expect(signalsGrid(undefined)).toEqual({ columns: [], rows: [] });
  expect(signalsGrid({ ...retrospective(), signals: null })).toEqual({
    columns: [],
    rows: [],
  });

  const doc = retrospective();
  const broken = doc.signals!.groups[0] as unknown as Record<string, unknown>;
  delete broken.firstPassCi;
  delete broken.drift;
  const grid = signalsGrid(doc);

  expect(grid.columns).toHaveLength(3);
  expect(grid.rows.find((row) => row.key === "drift")!.cells[0]?.value).toBe(
    "0 planned · 0 shipped",
  );
});

test("the deck reads the data branch's retrospective.json into the view", () => {
  const dir = mkdtempSync(join(tmpdir(), "live-"));
  try {
    mkdirSync(join(dir, "data"), { recursive: true });
    writeFileSync(
      join(dir, "data", "retrospective.json"),
      readFileSync(RETROSPECTIVE, "utf8"),
    );

    const { docs } = createLiveReader(dir).snapshot();

    expect(signalsGrid(docs.retrospective).columns).toHaveLength(3);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
