// @vitest-environment happy-dom
import { mount, type VueWrapper } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import ReviewersFoundView from "../components/ReviewersFoundView.vue";
import SameFogView from "../components/SameFogView.vue";
import StandupCardView from "../components/StandupCardView.vue";
import TonightView from "../components/TonightView.vue";
import WallCardView from "../components/WallCardView.vue";
import { fogGrid } from "../src/live/fog";
import { reviewCards } from "../src/live/reviews";
import { standupCard } from "../src/live/standup";
import { tonightRows } from "../src/live/tonight";
import { demoCard } from "../src/live/wall";
import { fixture } from "./fixtures";

const IMG = '<img src=x onerror="alert(1)">';
const MARKDOWN = "**bold** and [click](javascript:alert(1))";
const LINK = '<a href="javascript:alert(1)">click</a>';

// Every string a group's PR can put on a Day 1 view, made hostile.
function hostile() {
  const o = fixture("group-late");
  o.judgements.decisions.join.line = IMG;
  o.judgements.acceptanceExamples[0]!.example = MARKDOWN;
  o.judgements.slices[0]!.name = LINK;
  o.judgements.reviewHeadline = IMG;
  o.judgements.agentGotWrong[0]!.item = MARKDOWN;
  o.facts.skillsWritten = [LINK];
  o.judgements.now = LINK;
  return o;
}

function expectOnlyText(wrapper: VueWrapper, literals: string[]) {
  expect(wrapper.find("img").exists()).toBe(false);
  expect(wrapper.find("a").exists()).toBe(false);
  expect(wrapper.find("strong").exists()).toBe(false);
  for (const literal of literals) expect(wrapper.text()).toContain(literal);
}

describe("strings from a PR render as literal text, never as markup", () => {
  test("Same fog, three readings", () => {
    const wrapper = mount(SameFogView, {
      props: { grid: fogGrid([hostile()]) },
    });
    expectOnlyText(wrapper, [IMG, MARKDOWN]);
  });

  test("What the reviewers found", () => {
    const wrapper = mount(ReviewersFoundView, {
      props: { cards: reviewCards([hostile()]) },
    });
    expectOnlyText(wrapper, [IMG]);
  });

  test("the stand-up card", () => {
    const wrapper = mount(StandupCardView, {
      props: { card: standupCard([hostile()], "group-late")! },
    });
    expectOnlyText(wrapper, [MARKDOWN, LINK]);
  });

  test("the demo card", () => {
    const demo = { ...hostile(), group: "demo" };
    const wrapper = mount(WallCardView, {
      props: { card: demoCard([demo])! },
    });
    expectOnlyText(wrapper, [LINK]);
  });
});

test("the reviewers view shows four bucket counts per group and no total", () => {
  const wrapper = mount(ReviewersFoundView, {
    props: { cards: reviewCards([fixture("group-late")]) },
  });

  expect(wrapper.findAll(".rac-bucket-count").map((n) => n.text())).toEqual([
    "3",
    "2",
    "1",
    "1",
  ]);
  expect(wrapper.text()).not.toMatch(/total|\b7\b/i);
});

test("Tonight lights the files that have landed", () => {
  const wrapper = mount(TonightView, {
    props: { rows: tonightRows([fixture("group-a")]) },
  });

  expect(wrapper.text()).toContain("last push 14:40");
  expect(wrapper.findAll(".rac-thread-lit").map((li) => li.text())).toEqual([
    "AGENTS.md",
    "Glossary",
    "Spec",
    "How-we-worked",
  ]);
});

test("every view says what will fill it when no group has pushed", () => {
  expect(mount(SameFogView, { props: { grid: fogGrid([]) } }).text()).toContain(
    "fills as each group pushes its spec",
  );
  expect(mount(ReviewersFoundView, { props: { cards: [] } }).text()).toContain(
    "No group has opened its PR yet",
  );
  expect(mount(TonightView, { props: { rows: [] } }).text()).toContain(
    "No group has opened its PR yet",
  );
});
