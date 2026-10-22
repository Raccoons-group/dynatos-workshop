// PROTOTYPE (ticket 09). One shared store for every slide that shows live data:
// fetched once, then replaced on each push from the dev server.
import { useSyncExternalStore } from 'react'
import type { LiveDeckData } from '../../shared/live-deck'

let data: LiveDeckData | null = null
const listeners = new Set<() => void>()
let started = false

function set(d: LiveDeckData) {
  data = d
  listeners.forEach((l) => l())
}

function start() {
  started = true
  const load = () =>
    fetch('/__live-deck-data')
      .then((r) => r.json())
      .then(set)
      .catch(() => {})
  load()
  if (import.meta.hot) import.meta.hot.on('live-deck-data', set)
  else setInterval(load, 5000)
}

export function useLiveDeckData() {
  if (!started) start()
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => data,
  )
}
