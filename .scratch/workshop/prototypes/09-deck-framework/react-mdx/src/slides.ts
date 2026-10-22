// PROTOTYPE (ticket 09). One .mdx file per slide, in filename order.
import type { MDXContent } from 'mdx/types'

export type SlideMeta = { layout?: string; notes?: string }
export type Slide = { id: string; Content: MDXContent; meta: SlideMeta }

const modules = import.meta.glob<{ default: MDXContent; frontmatter?: SlideMeta }>('./slides/*.mdx', {
  eager: true,
})

export const slides: Slide[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, mod]) => ({ id: path, Content: mod.default, meta: mod.frontmatter ?? {} }))
