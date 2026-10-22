// PROTOTYPE (ticket 09). MDX runs before the React plugin so slides get Fast Refresh.
import { fileURLToPath } from 'node:url'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import { liveDeckData } from '../shared/vite-live-deck-data'

export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }) },
    react({ include: /\.(mdx|tsx?)$/ }),
    liveDeckData(fileURLToPath(new URL('../shared/live-deck-data', import.meta.url))),
  ],
})
