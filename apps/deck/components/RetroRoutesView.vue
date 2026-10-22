<script setup lang="ts">
// Renders the three routes: a lane per group, its stations as blocks along the afternoon, lunch shaded, and the
// checkpoint's label as ‖. A low-confidence block has a dashed edge.
import type { Routes } from "../src/live/retro";

defineProps<{ routes: Routes | null }>();
</script>

<template>
  <div v-if="routes && routes.lanes.length" class="rac-retro rac-routes">
    <div class="rac-routes-axis">
      <span
        v-for="t in routes.ticks"
        :key="t.label"
        class="rac-routes-tick"
        :style="{ left: `${t.left}%` }"
        >{{ t.label }}</span
      >
    </div>
    <div v-for="lane in routes.lanes" :key="lane.group" class="rac-lane">
      <span class="rac-wall-name">{{ lane.label }}</span>
      <div class="rac-lane-track">
        <span
          class="rac-lane-lunch"
          :style="{
            left: `${routes.lunch.left}%`,
            width: `${routes.lunch.width}%`,
          }"
          >lunch</span
        >
        <span
          v-for="(s, i) in lane.segments"
          :key="i"
          class="rac-segment"
          :class="`rac-sure-${s.confidence}`"
          :style="{ left: `${s.left}%`, width: `${s.width}%` }"
          :title="`${s.text} · ${s.sources.join(' · ')}`"
          >{{ s.station }}</span
        >
        <span
          v-if="lane.gate"
          class="rac-lane-gate"
          :style="{ left: `${lane.gate.left}%` }"
          :title="`spec-reviewed ${lane.gate.at}`"
          >‖</span
        >
      </div>
    </div>
  </div>
  <p v-else class="rac-wall-empty">
    The routes appear here once the coaches publish the retrospective.
  </p>
</template>
