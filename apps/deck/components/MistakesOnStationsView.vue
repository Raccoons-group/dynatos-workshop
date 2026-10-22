<script setup lang="ts">
// Renders the stations as columns, each with the mistakes that started there. "twice" marks a repeat.
import type { StationMistakes } from "../src/live/retro";

defineProps<{ stations: StationMistakes[] }>();
</script>

<template>
  <div
    v-if="stations.some((s) => s.mistakes.length)"
    class="rac-retro rac-mistakes"
  >
    <section v-for="s in stations" :key="s.station" class="rac-mistake-station">
      <p class="rac-stop-name">{{ s.station }}</p>
      <article
        v-for="(m, i) in s.mistakes"
        :key="i"
        class="rac-mistake"
        :class="`rac-sure-${m.confidence}`"
      >
        <p class="rac-mistake-text">{{ m.text }}</p>
        <p class="rac-claim-source">
          {{ m.label }} · {{ m.origin
          }}<span v-if="m.repeated" class="rac-twice">twice</span>
        </p>
      </article>
    </section>
  </div>
  <p v-else class="rac-wall-empty">
    The mistakes appear here once the coaches publish the retrospective.
  </p>
</template>
