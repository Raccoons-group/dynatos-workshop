// PROTOTYPE (ticket 09). Framework-neutral: Slidev and the React deck both run
// on Vite, so both use this same plugin.
//
// Serves the synced live-deck-data folder as one JSON snapshot, and pushes a new
// snapshot over Vite's own websocket whenever a file in it changes. A file that
// doesn't parse (a checkout caught mid-write) keeps that group's last good
// observation, so the projector never shows an error overlay.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Connect, Plugin } from 'vite'

export const LIVE_EVENT = 'live-deck-data'
export const LIVE_ENDPOINT = '/__live-deck-data'

export function liveDeckData(dir: string): Plugin {
  const groupsDir = resolve(dir, 'groups')
  const lastGood: Record<string, unknown> = {}

  function snapshot() {
    const groups: Record<string, unknown> = {}
    const files = existsSync(groupsDir)
      ? readdirSync(groupsDir).filter((f) => f.endsWith('.json')).sort()
      : []
    for (const file of files) {
      const name = file.slice(0, -'.json'.length)
      try {
        lastGood[name] = JSON.parse(readFileSync(join(groupsDir, file), 'utf8'))
      } catch {
        // torn write: keep the last good one
      }
      if (lastGood[name]) groups[name] = lastGood[name]
    }
    return { groups, readAt: new Date().toISOString() }
  }

  const serve: Connect.NextHandleFunction = (_req, res) => {
    res.setHeader('content-type', 'application/json')
    res.setHeader('cache-control', 'no-store')
    res.end(JSON.stringify(snapshot()))
  }

  return {
    name: 'live-deck-data',
    configureServer(server) {
      server.middlewares.use(LIVE_ENDPOINT, serve)
      server.watcher.add(groupsDir)
      let timer: ReturnType<typeof setTimeout> | undefined
      const onFile = (file: string) => {
        if (!resolve(file).startsWith(groupsDir)) return
        clearTimeout(timer)
        timer = setTimeout(
          () => server.ws.send({ type: 'custom', event: LIVE_EVENT, data: snapshot() }),
          150,
        )
      }
      server.watcher.on('add', onFile)
      server.watcher.on('change', onFile)
      server.watcher.on('unlink', onFile)
    },
    // `vite preview` of a built deck: same endpoint, the client polls instead.
    configurePreviewServer(server) {
      server.middlewares.use(LIVE_ENDPOINT, serve)
    },
  }
}
