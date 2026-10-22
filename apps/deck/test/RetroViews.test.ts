// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";

import DecisionsRevisitedView from "../components/DecisionsRevisitedView.vue";
import HowGroupsDroveView from "../components/HowGroupsDroveView.vue";
import HowThisWasMadeView from "../components/HowThisWasMadeView.vue";
import IsThisYouView from "../components/IsThisYouView.vue";
import MistakesOnStationsView from "../components/MistakesOnStationsView.vue";
import RetroRoutesView from "../components/RetroRoutesView.vue";
import WrongTwiceView from "../components/WrongTwiceView.vue";
import {
  decisionsRevisited,
  drivingColumns,
  howThisWasMade,
  isThisYouCards,
  mistakesOnStations,
  routeLanes,
  shortlistByThread,
} from "../src/live/retro";
import type { Retrospective } from "../src/live/retrospective";
import { FIXTURES_DIR } from "./fixtures";

const IMG = '<img src=x onerror="alert(1)">';
const LINK = '[click](javascript:alert(1)) <a href="javascript:alert(1)">x</a>';

// Every string a group or the synthesis can put on a Day 2 view, made hostile.
function hostile(): Retrospective {
  const doc = JSON.parse(
    readFileSync(join(FIXTURES_DIR, "..", "retrospective.json"), "utf8"),
  ) as Retrospective;
  doc.sources[0]!.note = IMG;
  doc.isThisYou[0]!.claim = IMG;
  doc.isThisYou[1]!.correction = LINK;
  doc.decisions[0]!.calls.join.line = IMG;
  doc.decisions[0]!.calls.deadline.rework = LINK;
  doc.driving[0]!.tool = IMG;
  doc.driving[0]!.corrections[0]!.text = LINK;
  doc.mistakes[0]!.text = IMG;
  doc.shortlist[0]!.item = LINK;
  return doc;
}

test("strings render as literal text in every retrospective view", () => {
  const doc = hostile();
  const views = [
    mount(HowThisWasMadeView, { props: { made: howThisWasMade(doc) } }),
    mount(RetroRoutesView, { props: { routes: routeLanes(doc) } }),
    mount(IsThisYouView, { props: { cards: isThisYouCards(doc) } }),
    mount(DecisionsRevisitedView, { props: { grid: decisionsRevisited(doc) } }),
    mount(HowGroupsDroveView, { props: { columns: drivingColumns(doc) } }),
    mount(MistakesOnStationsView, {
      props: { stations: mistakesOnStations(doc) },
    }),
    mount(WrongTwiceView, { props: { columns: shortlistByThread(doc) } }),
  ];

  for (const view of views) {
    expect(view.find("img").exists()).toBe(false);
    expect(view.find("a").exists()).toBe(false);
  }
  expect(views[2]!.text()).toContain(IMG);
  expect(views[2]!.text()).toContain(LINK);
  expect(views[6]!.text()).toContain(LINK);
});

test("a correction noted live replaces the question", () => {
  const view = mount(IsThisYouView, {
    props: { cards: isThisYouCards(hostile()) },
  });

  expect(view.text()).toContain("Yes or no?");
  expect(view.text()).toContain("You said");
});

test("every view says what will fill it before the retrospective is published", () => {
  expect(mount(RetroRoutesView, { props: { routes: null } }).text()).toContain(
    "once the coaches publish",
  );
  expect(mount(WrongTwiceView, { props: { columns: [] } }).text()).toContain(
    "once the coaches publish",
  );
});
