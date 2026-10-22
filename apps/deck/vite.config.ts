// Slidev merges this into its own Vite config. The live data lives in the repo root's `.live/` folder, which
// the sync script (`pnpm live:sync`) keeps current. LIVE_DIR points the deck elsewhere, for example at fixtures.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

import { liveDeckData } from "./src/live/plugin";

export default defineConfig({
  plugins: [
    liveDeckData({
      dir:
        process.env.LIVE_DIR ??
        fileURLToPath(new URL("../../.live", import.meta.url)),
    }),
  ],
});
