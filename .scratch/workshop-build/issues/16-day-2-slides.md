# 16: Day 2 slides

**What to build:** A presenter can run all of Day 2 from the deck: the retrospective, the skill lab and the action plan, ending with the closing round.

**Blocked by:** 12, 13, 14, 15

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] Slides 73–97 of the final outline, with the agenda's changes, including the closing-round slide after 96.
- [x] The retrospective, library list and action-plan grid views sit on their slides.
- [x] Presenter notes carry the timings, and the PDF export includes Day 2.

## Done

- **Where it lives:** `apps/deck/pages/day2.md`, imported after Day 1 from `slides.md`. It holds slides 73–96 of the outline plus the closing round, so the deck has 98 pages: page = outline + 1, because of Day 1's setup check.
- **Live views, one tag each:**
  - The retrospective views (from ticket 14) on 73 and 75–81, and `<TeamSignals />` on 78.
  - `<LibraryList />` on the lab (87) and show and tell (88).
  - `<ActionPlanGrid />` on 91, 92 and 95.
- **Notes:** each slide's notes start with the agenda's time, minutes and outline number. They cover the running order:
  - 92's 25 minutes and 95's 7 minutes
  - where the coaches run `library-list --watch` and `action-plan --watch`
  - how to note a correction live on 76: edit `.live/data/retrospective.json`, then `pnpm retro --publish`
- **Sources:** the facts on 74 (METR) and 90 (DORA's J-curve) are as the research notes give them, with the note named in the speaker notes.
- **PDF:** `pnpm --filter @workshop/deck export` now gives 100 pages (98, plus the stand-up's two extra click steps), Day 2 included. Checked in the browser and the PDF with all the Day 2 fixtures loaded.
