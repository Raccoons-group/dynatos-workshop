// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";

import TeamSignalsView from "../components/TeamSignalsView.vue";
import type { Retrospective } from "../src/live/retrospective";
import { signalsGrid } from "../src/live/signals";
import { FIXTURES_DIR } from "./fixtures";

const retrospective = (): Retrospective =>
  JSON.parse(
    readFileSync(join(FIXTURES_DIR, "..", "retrospective.json"), "utf8"),
  ) as Retrospective;

const mountGrid = (doc: unknown) =>
  mount(TeamSignalsView, { props: { grid: signalsGrid(doc) } });

test("strings from a group's files render as literal text, never as markup", () => {
  const doc = retrospective();
  const a = doc.signals!.groups[0]!;
  a.firstPassCi.slices[0]!.title = '<img src=x onerror="alert(1)"> **bold**';
  a.drift.outsidePlan = ["[click](javascript:alert(1))"];

  const wrapper = mountGrid(doc);

  expect(wrapper.find("img").exists()).toBe(false);
  expect(wrapper.find("a").exists()).toBe(false);
  expect(wrapper.find("strong").exists()).toBe(false);
  expect(wrapper.text()).toContain(
    '01 <img src=x onerror="alert(1)"> **bold**: 2 red, then green',
  );
  expect(wrapper.text()).toContain("[click](javascript:alert(1))");
});

test("shows the groups as columns and the signals as rows, every cell styled alike", () => {
  const wrapper = mountGrid(retrospective());

  expect(wrapper.findAll(".rac-signals-head").map((h) => h.text())).toEqual([
    "Group A",
    "Group B",
    "Group C",
  ]);
  expect(wrapper.findAll(".rac-signal-title").map((t) => t.text())).toEqual([
    "Time from intent to spec",
    "Spec rework",
    "First-pass CI",
    "Review rounds",
    "Drift between plan and diff",
  ]);
  const cells = wrapper.findAll(".rac-signal-cell");
  expect(cells).toHaveLength(15);
  // No colour scale: no cell carries a class or a style of its own.
  for (const cell of cells) {
    expect(cell.classes()).toEqual(["rac-signal-cell"]);
    expect(cell.attributes("style")).toBeUndefined();
  }
  expect(cells[0]!.find(".rac-signal-value").text()).toBe("120 min");
  expect(cells[0]!.findAll(".rac-signal-line").map((l) => l.text())).toEqual([
    "label at 14:35",
  ]);
});

test("before the overnight run it says when the signals arrive", () => {
  expect(mountGrid(undefined).text()).toContain(
    "The team signals arrive overnight",
  );
});
