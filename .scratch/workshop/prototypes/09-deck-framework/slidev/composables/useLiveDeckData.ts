// PROTOTYPE (ticket 09). One shared ref for every slide that shows live data:
// fetched once, then replaced on each push from the dev server.
import { ref } from 'vue'
import type { LiveDeckData } from '../../shared/live-deck'

const data = ref<LiveDeckData | null>(null)
let started = false

export function useLiveDeckData() {
  if (!started) {
    started = true
    const load = () =>
      fetch('/__live-deck-data')
        .then((r) => r.json())
        .then((d: LiveDeckData) => (data.value = d))
        .catch(() => {})
    load()
    if (import.meta.hot) import.meta.hot.on('live-deck-data', (d: LiveDeckData) => (data.value = d))
    else setInterval(load, 5000)
  }
  return data
}
