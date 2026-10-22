// PROTOTYPE (ticket 09). Slidev picks this up and merges it into its own Vite config.
// No `defineConfig` import: under pnpm, `vite` is Slidev's dependency, not ours.
import { fileURLToPath } from 'node:url'
import { liveDeckData } from '../shared/vite-live-deck-data'

export default {
  plugins: [liveDeckData(fileURLToPath(new URL('../shared/live-deck-data', import.meta.url)))],
}
