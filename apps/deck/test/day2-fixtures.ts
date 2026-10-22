// The Day 2 fixtures the scripts are tested with: the same files, so the scripts and the deck agree on the shape.
// Each call returns a fresh copy, so a test can change it freely.
import plan from "../../../scripts/test/fixtures/day2/action-plan.json";
import library from "../../../scripts/test/fixtures/day2/library.json";
import type { LibraryDoc } from "../src/live/library";
import type { PlanDoc } from "../src/live/plan";

export const libraryFixture = () => structuredClone(library) as LibraryDoc;
export const planFixture = () => structuredClone(plan) as PlanDoc;
