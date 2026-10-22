// @vitest-environment happy-dom
import { mount, type VueWrapper } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import ActionPlanGridView from "../components/ActionPlanGridView.vue";
import LibraryListView from "../components/LibraryListView.vue";
import { libraryList } from "../src/live/library";
import { planGrid } from "../src/live/plan";
import { libraryFixture, planFixture } from "./day2-fixtures";

const IMG = '<img src=x onerror="alert(1)">';
const MARKDOWN = "**bold** and [click](javascript:alert(1))";
const LINK = '<a href="javascript:alert(1)">click</a>';

function expectOnlyText(wrapper: VueWrapper, literals: string[]) {
  expect(wrapper.find("img").exists()).toBe(false);
  expect(wrapper.find("a").exists()).toBe(false);
  expect(wrapper.find("strong").exists()).toBe(false);
  for (const literal of literals) expect(wrapper.text()).toContain(literal);
}

describe("strings from a PR render as literal text, never as markup", () => {
  test("the library list", () => {
    const doc = libraryFixture();
    doc.entries[0]!.name = IMG;
    doc.entries[0]!.catches = MARKDOWN;
    doc.entries[0]!.toolsPassed = [LINK];
    doc.entries[1]!.name = LINK;

    expectOnlyText(
      mount(LibraryListView, { props: { list: libraryList(doc) } }),
      [IMG, MARKDOWN, LINK],
    );
  });

  test("the action-plan grid", () => {
    const doc = planFixture();
    doc.rows[1]!.quickWins[1]!.item = IMG;
    doc.rows[1]!.quickWins[1]!.why = MARKDOWN;
    doc.rows[0]!.chosen.quickWin = LINK;

    expectOnlyText(
      mount(ActionPlanGridView, { props: { grid: planGrid(doc) } }),
      [IMG, MARKDOWN, LINK],
    );
  });
});

describe("the library list", () => {
  test("a row per lab PR: tools lit where they passed, and open or merged", () => {
    const wrapper = mount(LibraryListView, {
      props: { list: libraryList(libraryFixture()) },
    });

    expect(wrapper.findAll(".rac-library-name").map((n) => n.text())).toEqual([
      "run-both-suites",
      "Lockfile guard",
      "explain-test-failure",
      "code-review",
      "Test project names in the AGENTS.md template",
    ]);
    expect(
      wrapper
        .findAll(".rac-threads")[0]!
        .findAll(".rac-thread-lit")
        .map((li) => li.text()),
    ).toEqual(["Claude Code", "Copilot"]);
    expect(wrapper.findAll(".rac-pr-merged")).toHaveLength(3);
    expect(wrapper.findAll(".rac-pr-open")).toHaveLength(2);
    expect(wrapper.text()).toContain("updated 10:55");
  });

  test("an empty list says what will fill it", () => {
    expect(
      mount(LibraryListView, {
        props: { list: libraryList(undefined) },
      }).text(),
    ).toContain("fills as each pair opens its PR into main");
  });
});

describe("the action-plan grid", () => {
  test("the winners stand out and an undrafted row waits", () => {
    const wrapper = mount(ActionPlanGridView, {
      props: { grid: planGrid(planFixture()) },
    });

    expect(wrapper.find(".rac-plan").classes()).toContain("rac-plan-voted");
    expect(
      wrapper.findAll(".rac-plan-chosen .rac-plan-item").map((n) => n.text()),
    ).toEqual(["Spec review before any code", "A short AGENTS.md per service"]);
    expect(wrapper.findAll(".rac-plan-waiting").map((n) => n.text())).toEqual([
      "waiting for the draft",
    ]);
    expect(wrapper.findAll(".rac-plan-by").map((n) => n.text())).toEqual([
      "Group A",
      "Group B",
    ]);
  });

  test("before any draft, every row waits", () => {
    const wrapper = mount(ActionPlanGridView, {
      props: { grid: planGrid(undefined) },
    });

    expect(wrapper.findAll(".rac-plan-waiting")).toHaveLength(4);
    expect(wrapper.find(".rac-plan").classes()).not.toContain("rac-plan-voted");
  });
});
