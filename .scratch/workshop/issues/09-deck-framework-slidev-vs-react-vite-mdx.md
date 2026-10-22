# Deck framework: Slidev vs React/Vite + MDX

Type: prototype (HITL)
Status: resolved
Blocked by: 01

## Question

Which deck framework fits: Slidev, or a custom React (Vite) app with MDX slides? Look at others only if one is clearly better. Build one Raccoons-styled slide in each that renders data from a JSON file and updates when that file changes.

Judge them on:

- How well agents can edit the slides
- Live data
- The Raccoons house style
- Presenter mode
- How well it fits in turborepo

## Answer

Prototyped with Matthias on 21 Oct 2026. Both decks, three fake observations and a sync simulator are in [prototypes/09-deck-framework/](../prototypes/09-deck-framework/). The full comparison is in its [README](../prototypes/09-deck-framework/README.md). Both prototypes render the same two slides: the colleague's 2 × 2 card layout and the "Same fog, three readings" grid from ticket 14.

- **Slidev.** Matthias picked it after seeing the two decks side by side. Presenter mode, notes, overview, drawing and PDF/PPTX export come built in. This week that weighs more than writing components in React. The React deck needed 135 hand-written lines and three fixes for a presenter view that only syncs within one browser.
- **The slides themselves don't depend on the framework.**
  - The slide bodies were the same markdown in both.
  - The Raccoons look is plain CSS that both decks share.
  - Write titles without the full stop, and the CSS adds the bold one. `**.**` straight after a word isn't bold in CommonMark.
  - An ordered list becomes the 2 × 2 cards.
- **Live data is one Vite plugin, whichever framework wins.**
  - It serves the synced `live-deck-data` folder and pushes every change over Vite's websocket. A change shows on the slide within about a second (the plugin waits 150 ms for writes to settle).
  - A file that doesn't parse keeps that group's last good observation. A checkout caught mid-write never flickers or shows an error overlay.
  - The deck counts lists for every number it shows.
- **Strings render as text only.** Components output JSON strings through `{{ }}`, never `v-html`. Tested with an `<img onerror>`, markdown and a `javascript:` link: all three show as literal text.
- **Agents.**
  - One `slides.md`, with `---` between slides and the notes in a trailing `<!-- -->`.
  - Slidev ships its own agent skill (a `SKILL.md` with about 40 references; pnpm asks to approve it) and an MCP server at `/__mcp`.
  - Custom components are Vue. We accept that for the handful of live-view components.
- **Turborepo and TypeScript.**
  - **Keep TS on `~6.0`.** Slidev 53 itself depends on `typescript ^6.0.3`.
  - Slidev builds to `dist/`, which turbo's `build` outputs already cover. It typechecks with `vue-tsc`.
  - Under pnpm, the deck package needs `vite` as a direct devDependency, for `vite.config.ts` and for the types.
  - The deck pulls in about 725 packages.
- **Offline.** Self-host Inter Tight with `@fontsource-variable/inter-tight` and set `fonts.provider: none`. The deck then makes no external requests. Live data needs Slidev's dev server running on the presenter laptop. The plugin also hooks `vite preview`, where the client polls instead, but that path is untested.
- **Export.**
  - `slidev export` works with `--executable-path` pointing at the local Chrome, so there's no Chromium download. It still needs `playwright-chromium` as a devDependency.
  - Turn animations off for print, since the export caught the grid's mount flash.

**Affects**

- **The `apps/deck` build:** replace the placeholder with Slidev, and copy the plugin, the brand CSS and `DecisionGrid.vue` from the prototype as a starting point. Rewrite them, don't promote them.
- [Live-deck pipeline spike](15-live-deck-pipeline-spike.md): the deck end is proven. The laptop's sync only has to write `groups/*.json` into the folder the plugin watches. The spike measures from push to slide.
- [Choose the storyline](12-choose-the-storyline.md) and [ticket 14](14-what-the-reporter-sees-and-what-the-retrospective-says.md)'s live views become Vue components in `apps/deck/components/`, each placed on a slide with a single tag.

**Fog.** Nothing graduates. "Rehearsal and fallbacks" gains two checks for the dry run: run the deck offline on the presenter laptop, and export a PDF of the deck as the no-laptop fallback.
