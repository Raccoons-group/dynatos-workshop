<script setup lang="ts">
// One mini ribbon: the wall's group cards and the talk slides' demo card. Every string from a PR goes through
// {{ }}, never v-html, so it shows as text.
import type { WallCard } from "../src/live/wall";

defineProps<{ card: WallCard }>();
</script>

<template>
  <article class="rac-card rac-wall-card">
    <header class="rac-wall-head">
      <span class="rac-wall-name">{{ card.label }}</span>
      <span class="rac-ci" :class="`rac-ci-${card.ci}`">
        {{ card.ci === "none" ? "no CI yet" : `CI ${card.ci}` }}
      </span>
    </header>

    <ol class="rac-ribbon" aria-label="Phase">
      <template v-for="(station, i) in card.stations" :key="station.name">
        <li
          v-if="i === 2"
          class="rac-gate"
          :class="{ 'rac-gate-passed': card.gatePassed }"
          :title="card.gatePassed ? 'Spec reviewed' : 'Spec not reviewed yet'"
        >
          ‖
        </li>
        <li class="rac-station" :class="`rac-station-${station.state}`">
          {{ station.name }}
        </li>
      </template>
    </ol>
    <ul class="rac-threads" aria-label="Threads">
      <li :class="{ 'rac-thread-lit': card.threads.context }">context</li>
      <li :class="{ 'rac-thread-lit': card.threads.skills }">skills</li>
      <li :class="{ 'rac-thread-lit': card.threads.checks }">checks</li>
    </ul>

    <p class="rac-wall-now">{{ card.now }}</p>
    <p class="rac-wall-notable">{{ card.notable }}</p>

    <footer class="rac-wall-foot">
      <span>{{ card.firstGreen ? `first green ${card.firstGreen}` : "" }}</span>
      <span :class="{ 'rac-stale': card.fresh.stale }">{{
        card.fresh.text
      }}</span>
    </footer>
  </article>
</template>
