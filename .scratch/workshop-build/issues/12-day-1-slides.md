# 12: Day 1 slides

**What to build:** A presenter can run all of Day 1 from the deck: the talk with the live views in place, the exhibits pulled from this repo, and a PDF as the no-laptop fallback.

**Blocked by:** 09, 11

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] Slides 1–72 of the final outline, with the agenda's changes: the opening round on slide 3, the setup check after slide 7, the "Tonight" checklist on 69, and "what happens tonight" on 72.
- [x] Presenter notes carry the timings. Each demo slide shows its starting fallback tag in a corner.
- [x] The exhibits render live: the map's decisions, the repo's PR list, the root AGENTS.md, the glossary and the shared skills folder. The footer shows "last update from GitHub hh:mm".
- [x] Each live view sits on its slide as a single tag.
- [x] PDF export works with the local Chrome and animations off. The deck runs offline.

## Done

- **Where the slides live:** `apps/deck/slides.md` holds the headmatter and slide 1, then imports `pages/day1.md` (`src:`). Ticket 16 can add `pages/day2.md` the same way without touching Day 1.
- **The setup check** is its own slide after 7, so from there on **the deck's page numbers run one ahead of the outline**. Every slide's notes start with its time, minutes and outline number (for example `11:40 · 3 min · outline 48`).
- **Layouts:**
  - `default` takes a `kicker` (the station or thread) and `call: fixed | yours`, which shows a "Fixed" or "Your call" badge.
  - `demo` narrows the column for `<DemoCard />` and shows `fallback:` in the bottom corner as "starts from demo/…": 21, 32, 34, 36, 37, 39, 53, 57, 61, 63.
  - `data` takes a `kicker` too.
  - A title ending in "?" uses `{.rac-q}` (`mdc: true`), so it doesn't also get the full stop.
- **Exhibits:**
  - Read live from the repo through `src/exhibits/files.ts` (Vite glob, hot-reloaded), parsed by pure functions in `src/exhibits/parse.ts`.
  - The components: `<MapExhibit />` (5, 31), `<PullRequests />` (6, from the sync's PR list), `<FileExhibit path=… />` (17: AGENTS.md beside the template; 59: the CI guard), `<GlossaryExhibit />` (19) and `<SkillsExhibit />` (27). A station's skill lights once its folder exists, so `read-issue`, `open-pr` and `how-we-worked` light up when ticket 06 lands.
- **The footer** on every slide is `global-top.vue`, showing "last update from GitHub hh:mm", or "offline · …", or "not synced with GitHub yet". It has to be global-*top*: global-bottom renders behind the slides' opaque background.
- **Static ribbon:** `<Ribbon mode="artifacts | gates | threads | agenda" />` for 7, 11, 12, 43 and 62, and `<EmptyCard />` for 42.
- **Live views, one tag each:**
  - `<Wall />` on 47 and 66, and `<SameFog />` on 49.
  - `<ReviewersFound />` with `<Tonight />` stacked on 69.
  - `<StandupCard group=… />` ×3 inside a `<v-switch>` on 70: click to the next group.
- **Export:** `pnpm --filter @workshop/deck export` uses the local Chrome with `--with-clicks`, so all three stand-up cards get a page. It writes `dist/deck.pdf` (75 pages) in about 40 s. Print CSS turns the card flash off.
- **Offline:** the build references no external hosts beyond SVG namespaces and doc links in error messages.
- **Tests:** 10 new (48 in the deck). They cover the map, glossary, skills, excerpt and PR-list parsers and the footer text, and check that every exhibit file resolves.
- **Dev gotcha:** after adding a root layer file (`global-top.vue`), the browser can keep serving Vite's old immutable module. Delete `apps/deck/node_modules/.vite` and the Slidev CLI's `.vite`, or use a fresh browser profile.
