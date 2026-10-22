// One shared snapshot for every slide that shows live data: fetched once, then replaced on each push from
// the dev server. A built deck (no dev server) polls instead.
import { ref } from "vue";

import { LIVE_ENDPOINT, LIVE_EVENT } from "../src/live/constants";
import type { LiveSnapshot } from "../src/live/types";

const snapshot = ref<LiveSnapshot | null>(null);
let started = false;

export function useLive() {
  if (!started) {
    started = true;
    const load = () =>
      fetch(LIVE_ENDPOINT)
        .then((response) => response.json())
        .then((data: LiveSnapshot) => (snapshot.value = data))
        .catch(() => {});
    load();
    if (import.meta.hot)
      import.meta.hot.on(LIVE_EVENT, (data: LiveSnapshot) => {
        snapshot.value = data;
      });
    else setInterval(load, 5000);
  }
  return snapshot;
}
