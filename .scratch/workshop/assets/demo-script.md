# Live demo script: allergens on the menu

> Resolves [Live demo script](../issues/18-live-demo-script.md). Agreed with Matthias on 22 Oct 2026 in three rounds (Q1–Q21). Slide numbers refer to the [final outline](storyline-final.md), and clock times to the [agenda](agenda.md). It's a plan: no issue, base, tag, skill or script exists yet.
>
> **No spoilers.** The story was picked with the coach notes in hand, so it stays clear of what groups should find in Forkful. Nothing from the coach notes appears here, and nothing may be added.

## At a glance

- **The story:** a sibling story on the same Forkful app, "Show allergens on the menu", filed as a GitHub issue with the label `demo`. It isn't the groups' epic.
- **Two chains.**
  - **Part 1** runs live from 21 to 39, with the spec on 34 prepared.
  - **Part 2** always starts from `demo/04-sliced` and goes **tag to tag**: each segment starts from the previous station's fallback tag, and the driver says so out loud.
- **Every fixed gate is passed:**
  - the draft PR (36)
  - the checkpoint by the checkpoint coach (37)
  - how-we-worked before every push
  - review by a second tool (57)
  - slice 1 green in CI (61)
  - the merge once green, right after the talk
- **Tools:** Claude Code everywhere, except the review on 57, which runs in Codex CLI. Switch to Copilot CLI if Dynatos's answer on tools points there.
- **One demo laptop** on the projector, with both CLIs installed and signed in. Nobody swaps HDMI.
- **Three pushes:** 36, 61, and the learn commit right after the talk. Everything else stays local until the next push.
- **The demo card is shown only on talk slides,** never on the wall (see **Wall** in [GLOSSARY.md](../GLOSSARY.md)).

## The story

### The issue (filed once, label `demo`, shown on slide 14)

> **Show allergens on the menu**
>
> Customers keep phoning restaurants to ask what's in a dish, and last month someone with a nut allergy ordered a curry that turned out to contain almonds. We want Forkful to show allergens on the menu.
>
> Things that came up (we didn't all agree):
>
> - Which allergens? There's an official list, I think.
> - Some restaurants say "may contain traces of nuts". Do we show that?
> - Who fills this in? Restaurants won't like another form.
> - Can customers filter out dishes they can't eat?
> - What do we show if a restaurant hasn't told us?
>
> — Forkful product team

### The product card (for the checkpoint coach, who plays product on 32)

The agent's questions vary from run to run, but product's answers don't. That way the live grill reaches the same decisions as the prepared spec (34) and the Part 2 tags.

| If the agent asks about… | Product says |
|---|---|
| Which allergens | A fixed list, not free text: the EU's 14 allergens, by name |
| A dish nobody declared | **Unknown is not none.** It shows "Ask the restaurant", never an empty list or "no allergens". This is the headline decision |
| "May contain traces" | Out of scope. "Contains" only |
| Who enters the data | Seed data for now. Restaurants entering their own allergens in the kitchen view comes later |
| Filtering | Show first, filter later. Each dish's allergens come first, and a "hide dishes with…" filter after that |
| When I hide gluten, what happens to dishes nobody declared? | **Handed back:** "What would you recommend?" Then steer to the fixed answer: hide them, and say how many were hidden |

**Glossary terms** the grill writes into the demo branch's `case/GLOSSARY.md` (case terms, never CONTEXT.md):

- **Allergen**: one of the EU's 14. _Avoid_: ingredient, intolerance.
- **Allergen info**: what a restaurant has declared for a dish, which can be some allergens, none of the 14, or unknown. _Avoid_: allergen-free.

**What the prepared spec holds** (`work/demo/spec.md`, made in rehearsal):

- **Acceptance examples:**
  - A dish declared with Gluten and Milk shows "Gluten, Milk".
  - A dish declared with none shows "None of the 14 allergens".
  - A dish with no allergen info shows "Ask the restaurant".
  - (Ticket 2) Hiding Gluten hides the dishes that contain it and the dishes with no info, and says how many were hidden.
- **The seam:** the menu endpoint, tested through `WebApplicationFactory` like the existing menu test.
- **Out of scope:** "may contain", and anything outside the menu.

### The slices (`work/demo/issues/`)

Each ticket passes "could you demo this?":

1. **See a dish's allergens.** Each dish on the menu shows its declared allergens, or "Ask the restaurant" when unknown. It covers the seed, the API and the Menu page, and it's proved by tests at the menu endpoint plus one UI test. **Part 2 builds this one.**
2. **Hide dishes with an allergen.** A filter on the menu, where undeclared dishes are hidden too, with a count. Proved at the menu endpoint.
3. **A restaurant declares its allergens** in the kitchen view.

**The naive per-layer split** (data → API → UI → filter) is prepared on slide 39 for contrast. "Could you demo ticket 1?" gets a no.

### The one-sentence skill (`say-it-back`, slide 21, dissected on 25)

It lives on the demo base only (`.agents/skills/say-it-back/SKILL.md`), so the Day 1 library stays as ticket 16 decided. Slide 25 invites groups to write their own. The skill:

```markdown
---
name: say-it-back
description: Use when starting on an issue, before planning or changing anything.
---

Before you act on an issue, restate it in your own words in at most five lines (what is asked, what is already decided, what is still open), wait for the user's yes, and save the agreed restatement to the working-out folder as `read.md`.
```

### Why this story, and how it stays clean

- **Allergens touch only dishes, the menu endpoint and the Menu page.** The fog is real, and it gives product decisions to make in front of the two POs. It has a sharp edge case for the test (missing data must never read as "free of"), and an agent mistake that repeats reliably, which is the input for 63.
- **Rejected after checking the coach notes:** a note to the kitchen (Storyline A's example), favourites, ratings, search, "order again", and promotions.
- **Keeping the live agent off what groups should find** (Q2):
  1. **The build keeps the story's path clean.** Forkful isn't built yet. Whoever builds it, with the coach notes in hand, keeps the dish entity, the menu endpoint and the Menu page free of everything the coach notes plant.
  2. **The demo never writes Forkful's context.** `case/AGENTS.md` stays the stub that `open-pr` commits, and the demo's glossary holds only the two terms above. The demo card's context light stays off, and slide 65 says "that one is yours this afternoon".
  3. **Every tag is grepped** for the coach-notes terms before it's pushed (ticket 02's check).
  4. **Every prompt is scoped to the story's files**, and rehearsed. If something unrelated surfaces on screen, the driver moves on without comment.

## People

The agenda leaves names to the coaches, so this script names roles only:

| Role | In the demo |
|---|---|
| **Part 1 lead** | Drives 21, 32, 34, 36 and 39. After the talk, pushes `demo/08-learned` and merges, because the checkpoint coach is at overflow checkpoints then |
| **Checkpoint coach** | Plays product on 32 from the product card. Does the live checkpoint on 37 from their own laptop and GitHub account |
| **Part 2 lead** | Runs the lunch reset. Drives 53, 61 and 63 |
| **The other coach in Part 2** | Starts the review in Codex at the end of 53, and walks through its findings on 57. It's another tool and another person, like the review block |

## The script

**Kick off, then talk.** Long agent runs start before the slide that shows them, while a coach presents. The room sees an agent working while the humans do something else.

### Summary

| Slide | Clock | Min | Station | Who | Tool | Starts from | Fallback tag |
|---|---|---|---|---|---|---|---|
| 21 | about 10:02 | 3 | Read | Part 1 lead | Claude Code | `demo/main`, on a local `demo/allergens` | `demo/01-read` |
| 32 | 10:19 | 5 | Explore | Part 1 lead, with the checkpoint coach as product | Claude Code | the same session | `demo/02-explored` |
| 34 | about 10:25 | 2 | Specify (prepared) | Part 1 lead | editor | the spec from 03 | — |
| 36 | 10:28 | 2 | Specify: the draft PR | Part 1 lead | Claude Code | the spec from 03 | `demo/03-specified` |
| 37 | 10:30 | 2 | The checkpoint | Checkpoint coach | GitHub, own laptop | the PR from 36 | `demo/03-specified` |
| 39 | 10:34 | 3 | Slice | Part 1 lead | Claude Code | the same session | `demo/04-sliced` |
| lunch | before 13:20 | — | Reset | Part 2 lead | `pnpm demo:reset` | — | `demo/04-sliced`, pushed |
| 53 | 13:35 | 5 | Build | Part 2 lead | Claude Code | `demo/04-sliced` | `demo/05-built` |
| (end of 53) | about 13:40 | — | Start the review | the other coach | Codex CLI | `demo/05-built` | — |
| 57 | 13:46 | 4 | Review | the other coach | Codex CLI | the run started at 13:40 | `demo/06-reviewed` |
| 61 | 13:54 | 3 | Ship | Part 2 lead | Claude Code | `demo/06-reviewed` | `demo/07-shipped` |
| 63 | 13:59 | 3 | Learn | Part 2 lead | Claude Code | 61's push | `demo/08-learned` |
| after the talk | 14:05–14:20 | — | Push and merge | Part 1 lead | `pnpm demo:reset`, GitHub | `demo/08-learned` | — |

The **Starts from** tag is shown in a corner of each demo slide.

### Part 1 (live, 15 minutes plus the prepared spec)

The demo laptop starts on a local branch `demo/allergens`, cut from `demo/main`. Nothing is pushed before 36.

**21 · Read** (about 10:02, 3 min, Claude Code)

- **Typed:** `/read-issue <demo issue>`, then `/say-it-back`.
- **Shown:** the issue pulled into the terminal, then the agent's restatement in its own words: what's asked, what's decided, and the five open points. The driver confirms it, or corrects one thing.
- **Expected:** the restatement saved to `work/demo/read.md` and committed locally.
- **Fallback:** `demo/01-read`, and the recording.

**32 · Explore** (10:19, 5 min, Claude Code)

- **Before:** lower the effort setting for grilling, so the demo follows its own house rule (slide 45).
- **Typed:** `/grill-with-docs` on the issue.
- **Shown:**
  - rounds of numbered questions, each with a recommended answer
  - the checkpoint coach answering as product from the product card, and handing one question back ("What would you recommend?")
  - `case/GLOSSARY.md` growing with Allergen and Allergen info
- **Expected:** the six decisions on the card are reached, and the glossary holds the two terms. Commit locally.
- **Fallback:** `demo/02-explored`.

**34 · Specify, prepared** (about 10:25, 2 min, no agent)

- **Typed:** `git checkout demo/03-specified -- work/demo/spec.md`.
- **Shown:** the spec next to the product card. Each decision is a line, the acceptance examples are there, and so are the seam and what's out of scope. The spec only records what the grill decided.

**36 · The draft PR** (10:28, 2 min, Claude Code)

- **Typed:** `/how-we-worked` first, shown in full once ("Observed by the agent", then 2–3 questions answered in one line each). Then `/open-pr`.
- **Expected:**
  - `open-pr` commits the spec, the stub `case/AGENTS.md` and the note, pushes `demo/allergens`, and opens a **draft** PR into `demo/main` with "Part of #<demo issue>".
  - The demo card appears on the demo slide by 39 (about 10:34), and at the latest by 10:38.
- **Fallback:** `pnpm demo:reset demo/03-specified`, which opens the draft PR and adds the label.

**37 · The checkpoint** (10:30, 2 min, the checkpoint coach on their own laptop)

- **Shown:** the PR's spec on the projector. The checkpoint coach checks it aloud, in one minute, against slide 48's five questions:
  - Does it match the issue?
  - Are the acceptance examples there?
  - Is the seam agreed?
  - Is out of scope named?
  - Could someone who wasn't there build from it?

  Then they add `spec-reviewed`, and the driver refreshes the PR so the room sees who added it.
- **Expected:**
  - The `labeled` event runs the reporter, and the card passes the gate to Slice by 10:38.
  - If `labeled` doesn't trigger, the checkpoint coach re-runs the reporter by hand (`workflow_dispatch`).
- **Fallback:** `pnpm demo:reset demo/03-specified`.

**39 · Slice** (10:34, 3 min, Claude Code)

- **Typed:** `/to-tickets`. The driver asks "could you demo this?" of each proposed ticket.
- **Shown:** the agent's tickets next to the naive per-layer split prepared on the slide.
- **Expected:** three tickets in `work/demo/issues/`, as listed above, committed locally and **not pushed**. The card is already at Slice because of the label.
- **Fallback:** `demo/04-sliced`, which Part 2 starts from anyway.

### Lunch (the Part 2 lead, before 13:20)

1. Run `pnpm demo:reset demo/04-sliced`. It force-pushes, keeps the PR a draft and keeps the label. CI and the reporter run, and lunch hides the latency, so slide 50 shows the card at Slice.
2. Open two terminal tabs at the repo root on `demo/allergens`: Claude Code in one, Codex in the other.
3. Run a warm `dotnet build`.

### Part 2 (live, 15 minutes, tag to tag)

**53 · Build** (13:35, 5 min, Claude Code)

- **Typed:** `/implement` on ticket 1. When asked, the driver answers "test-first".
- **Shown:**
  - With `tdd`, the agent writes one failing test at the menu endpoint: "a dish with no declared allergens comes back as unknown, not as an empty list". The driver shows it failing for the right reason, and the agent makes it pass.
  - Then, for 30 seconds, the **prepared tautological test** next to it. It builds a response with Gluten and asserts that it contains Gluten: "this one can never fail". It's never committed.
- **Then:** `git reset --hard demo/05-built`, saying out loud "the rest of slice 1, built the same way in rehearsal".
- **Expected:** red, then green, in two test runs of a few seconds each, thanks to the warm build.
- **Fallback:** jump to `demo/05-built` straight away.

**Start the review** (about 13:40, end of 53, the other coach)

- **Typed:** `$code-review` in the Codex tab, against `demo/main`. The coach says "this takes a few minutes", and the Part 2 lead presents 54–56 (6 min) while it runs.

**57 · Review** (13:46, 4 min, Codex CLI, the other coach)

- **Shown:** the findings on two axes, standards and spec, appended to `work/demo/review.md` as round 1 under Act on, Consider, Noted and Dismissed. The coach walks through one finding per bucket.
- **Then:** `git reset --hard demo/06-reviewed`: "the act-on fixes, made in rehearsal".
- **If the run isn't finished:** show the round-1 `review.md` in `demo/06-reviewed`. It came from the same skill in the same tool.
- **Fallback:** `demo/06-reviewed`.

**61 · Ship** (13:54, 3 min, Claude Code)

- **Typed:** `/how-we-worked` (one-line answers), then `/open-pr`. It marks the PR ready and writes the body with its evidence:
  - the Menu page screenshot (in `demo/06-reviewed`), showing allergens and one "Ask the restaurant"
  - the seam tests' names as proof
  - the merge danger, called low: read-only on the menu, and one new field with no default

  Then it pushes.
- **Shown:** the PR going ready, and CI starting.
- **Expected:** the reporter runs read-only after the tests, and the card shows Ship with slice 1 green by slide 65 (about 14:03).
- **Fallback:** `pnpm demo:reset demo/07-shipped`, which force-pushes and marks the PR ready.

**63 · Learn** (13:59, 3 min, Claude Code)

- **Shown:** `work/demo/how-we-worked.md` at the rehearsal's line: the agent twice wrote "no data" as an empty list, once in the seed and once in the response mapping, and the seam test caught the second. The driver says it came from rehearsal.
- **Typed:** "Make it impossible to write unknown as none: allergen info is either unknown or declared, with no default."
- **Expected:** the first compiler errors appear, pointing at every place that assumed "empty means none". The compiler now finds what the agent missed: that's the highest rung that works (types), rather than a test or an AGENTS.md line, which the demo doesn't write.
- **Then:** "here's the finished change": `demo/08-learned`, shown locally and not pushed on stage.
- **Fallback:** `demo/08-learned`.

**65 · The loop, once more** (about 14:03)

- The demo card shows Ship, with slice 1 green and every station ticked. The context light is off: "that one is yours this afternoon". "We merge once it's green."

### After the talk (the Part 1 lead, 14:05–14:20, off stage)

1. Run `pnpm demo:reset demo/08-learned`. It force-pushes over 61's live commit, and the PR stays ready, with the label.
2. Once CI is green, merge into `demo/main` with a merge commit. A closed PR triggers no run, so the card keeps its last observation.

## Fallback tags

The eight tags form **one linear chain**, made in the final rehearsal on `demo/allergens`. After the grep, they're pushed to GitHub, so either coach can restart from their own laptop.

| Tag | Adds | GitHub state that `pnpm demo:reset` sets |
|---|---|---|
| `demo/01-read` | `work/demo/read.md` | no PR |
| `demo/02-explored` | `case/GLOSSARY.md` (Allergen, Allergen info) | no PR |
| `demo/03-specified` | `work/demo/spec.md`, the stub `case/AGENTS.md`, how-we-worked's first section | draft PR, `spec-reviewed` |
| `demo/04-sliced` | `work/demo/issues/01–03` | draft PR, `spec-reviewed` |
| `demo/05-built` | Slice 1: allergen info on dishes and in the seed, the menu endpoint, the Menu page, the seam tests and one UI test, "test-first" recorded | draft PR, `spec-reviewed` |
| `demo/06-reviewed` | `work/demo/review.md` (round 1), the act-on fixes, the Menu page screenshot | draft PR, `spec-reviewed` |
| `demo/07-shipped` | a how-we-worked section, the PR body with evidence, ticket 1 marked shipped | ready, `spec-reviewed` |
| `demo/08-learned` | the type change, and a how-we-worked section | ready, `spec-reviewed`; merged once green |

During the talk, 05 and 06 are only local jumps, and the PR stays at 04 until 61. The GitHub state in the table applies when a segment restarts from that tag.

**`pnpm demo:reset <tag>`** (`scripts/demo-reset.mjs`) is coach-only. It lives on `main` and never on the bases. It:

1. hard-resets `demo/allergens` to the tag and force-pushes it, so CI and the reporter rerun for that commit and the card follows (it may move back)
2. opens the PR into `demo/main` if it's missing, and sets draft or ready as the table says
3. adds or removes `spec-reviewed`
4. never closes the PR, so its number and its card stay

**What a tag can't hold, and why that's fine:**

- **Review comments:** there are none on GitHub. The review lives in `review.md`, inside the tag.
- **Old CI runs:** aren't restored. The card only needs the current commit's CI.

## The demo's base

- **`demo/main` is a fourth base,** cut from `case-start` by the same script as the group bases. On top of `case-start` it adds `.agents/skills/say-it-back/`.
- **One long-lived PR** from `demo/allergens` into `demo/main`, opened as a draft on 36. The reporter reads it like a group's PR.
- **What `docs/agents/` says on `demo/main`:**

| Key | Demo |
|---|---|
| Group | `demo` |
| Base branch | `demo/main` |
| Work branch | `demo/allergens` |
| Working-out | `work/demo/` |
| Epic | `#<demo issue>`, written "Part of #<n>" |

- **The tags and the branches share the `demo/` prefix** in different ref namespaces, which git allows.
- **The demo is left out** of the wall, the decision grid (49), "What the reviewers found" (69), the stand-up card, "Tonight", the retrospective and the team signals.

## When a segment can't run live at all

- **A recording of each live segment** from the final dry run, kept on the demo laptop. The driver switches to it and narrates over it.
- **A phone hotspot** for the demo laptop.
- **The demo runs on a coach's own subscription,** never the reporter's key.
- **Part 2 has no slack**, so an overrun restarts from the next tag rather than running long.

## Before Day 1

- [ ] File the demo issue, with the label `demo`.
- [ ] The cut script makes `demo/main` (above) along with the group bases.
- [ ] Three full dry runs, each restarting from every tag. Make the tags from the final one, then grep them and push them.
- [ ] Record each live segment.
- [ ] On the demo laptop:
  - Claude Code and Codex CLI signed in
  - `gh` signed in as the Part 1 lead
  - a warm `pnpm install` and `dotnet build`
  - the prepared tautological test and the naive split at hand
- [ ] Close the rehearsal PRs, delete the remote `demo/allergens`, and clear the demo's file on `live-deck-data`, so 36 opens a fresh PR live.
