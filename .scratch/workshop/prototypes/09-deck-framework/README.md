# PROTOTYPE: deck framework, Slidev vs React (Vite) + MDX

Throwaway code for [ticket 09](../../issues/09-deck-framework-slidev-vs-react-vite-mdx.md). Don't build on it: the real deck goes in `apps/deck` once the ticket is resolved.

Both decks show the same two slides in the Raccoons dark style:

1. **AI amplifies.** A content slide: a title and an ordered list that renders as the 2 × 2 card grid from the colleague's deck.
2. **Same fog, three readings.** A data slide: the decision grid from ticket 14 (the epic's seven points × the groups), read from `groups/*.json` and re-rendered whenever a file changes on disk.

The slide bodies are the same markdown in both. Only the frontmatter and notes syntax differ.

## Run it

This folder is its own pnpm workspace, outside the repo's.

```bash
pnpm install
pnpm sync        # terminal 1: resets shared/live-deck-data/ and rewrites one group every 6 s
pnpm slidev      # terminal 2: http://localhost:3030 (presenter at /presenter/1)
pnpm react       # terminal 3: http://localhost:3031 (presenter at /?presenter, print at /?print)
```

`pnpm sync:torn` writes half a file before each whole one, like a checkout caught mid-write. Neither deck should flicker or show an error.

## What's where

| Path | What |
| - | - |
| `shared/seed/groups/*.json` | Three fake observations shaped like `assets/reporter-and-retrospective.md`. Group C carries HTML, markdown and a `javascript:` link in its strings, which must show as plain text |
| `shared/simulate-sync.mjs` | Stands in for the laptop's 10 s sync of the `live-deck-data` branch |
| `shared/vite-live-deck-data.ts` | A Vite plugin both decks use: serves the folder as one JSON snapshot and pushes changes over Vite's websocket, keeping the last good file when one doesn't parse |
| `shared/live-deck.ts` | Observation types, the seven decision keys and labels, and the "deck counts lists" helper |
| `shared/raccoons.css` | Brand tokens, frame, card and grid styles, shared by both decks |
| `slidev/` | `slides.md`, two layouts, `DecisionGrid.vue`, a composable, and a `vite.config.ts` that adds the plugin |
| `react-mdx/` | One `.mdx` per slide in `src/slides/`, `DecisionGrid.tsx`, a store hook, and `App.tsx` with the hand-built navigation, presenter view and print view |

## What the prototypes showed (21 Oct 2026)

Measured on Matthias's laptop with Slidev 53.0.0, Vite 8.3, React 19.3, MDX 3.1 and TypeScript 6.0.3.

| Criterion | Slidev | React (Vite) + MDX |
| - | - | - |
| **Agents editing slides** | One `slides.md`, `---` between slides, notes in a trailing `<!-- -->`. Ships its own agent skill (`skills/slidev/SKILL.md` plus about 40 references; pnpm asks to approve it) and an MCP server at `/__mcp`. Custom components are Vue | One `.mdx` file per slide, notes in YAML frontmatter. The slide bodies are the same markdown as Slidev's. Components are React, like the case. But agents also maintain the deck engine itself (`App.tsx`) |
| **Live data** | Same Vite plugin. A change reaches the slide within about a second (150 ms debounce). Torn writes: no flicker, no overlay, all three groups kept | Identical |
| **Strings as text** | `{{ }}` only, never `v-html`. Group C's `<img onerror>`, `**bold**` and `javascript:` link show as plain text | `{…}` only, never `dangerouslySetInnerHTML`. Same result |
| **Raccoons style** | Same shared CSS, plus one reset rule for Slidev's layout padding. Its markdown makes quotes curly (`can’t`) | Same shared CSS, no resets. Straight quotes |
| **Presenter mode** | Built in: current and next slide, notes rendered and editable in place, timer, drawing, overview, screen mirror. Syncs through the dev server, so a second device works too (`--remote`) | Hand-built: `App.tsx` (135 lines, with navigation and the print view) plus the shell CSS. It took three fixes to get right. Current, next, notes, timer, clock. Syncs over BroadcastChannel, so only within one browser |
| **Hot edits** | Editing `slides.md` updates in place, staying on the same slide | Updates in place. MDX's `frontmatter` export defeats Fast Refresh, so it falls back to re-rendering `App` (no reload) |
| **Turborepo / TS 6.0** | Builds to `dist/` in 1.6 s and typechecks with `vue-tsc` on TS 6.0.3. **Slidev 53 itself depends on `typescript ^6.0.3`**, so the repo pin matches it. Under pnpm it needs `vite` as a direct devDependency, for `vite.config.ts` and for types. About 725 packages | Builds to `dist/` in 0.2 s and typechecks with `tsc` on TS 6.0.3. About 207 packages |
| **Offline** | No external requests, with Inter Tight self-hosted through `@fontsource-variable`. About 250 local modules in dev | No external requests. 23 modules in dev |
| **Export** | `slidev export` gives PDF, PPTX or PNG through `playwright-chromium`, here pointed at the local Chrome with `--executable-path`. Took 14 s. It captured the cells' mount animation, so the real deck should turn animations off for print | Chrome headless `--print-to-pdf` on `/?print` gives a correct 2-page PDF. PPTX would need more work |
| **Framework-specific code** | 94 lines, plus 38 in `slides.md` | 351 lines, plus 25 in the slides |

Live data and the brand CSS are the same in both, because both decks are Vite underneath. The real difference is what's built in (presenter, export, code highlighting, Mermaid) against the component language (Vue vs React) and the size of the dependency tree.
