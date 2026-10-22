// Tests run without Slidev: view models and the plugin in Node, components in happy-dom.
import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // Resolved here, in Node: inside happy-dom, import.meta.url isn't a file URL.
    env: {
      OBSERVATION_FIXTURES: fileURLToPath(
        new URL("../../scripts/test/fixtures/observations/", import.meta.url),
      ),
    },
  },
});
