<script setup lang="ts">
// The ribbon, drawn large: the stations along the top with the checkpoint gate, the threads underneath.
// `artifacts` shows what each station commits, `gates` what's fixed, `threads` the bottom row lit, and `agenda`
// the day and a half laid over the stations.
import { AGENDA_BANDS, FIXED_GATES, RIBBON, THREADS } from "../src/ribbon";

const props = withDefaults(
  defineProps<{ mode?: "artifacts" | "gates" | "threads" | "agenda" }>(),
  { mode: "artifacts" },
);

// The gate sits in its own narrow column between Specify and Slice.
const column = (i: number) => (i < 3 ? i + 1 : i + 2);
const span = (from: number, to: number) =>
  `${column(from)} / ${column(to) + 1}`;
</script>

<template>
  <div class="rac-ribbon-big" :class="`rac-ribbon-${props.mode}`">
    <template v-if="mode === 'agenda'">
      <div
        v-for="(band, i) in AGENDA_BANDS"
        :key="band.label"
        class="rac-band"
        :style="{ gridColumn: span(band.from, band.to), gridRow: i + 1 }"
      >
        <span class="rac-band-when">{{ band.when }}</span> {{ band.label }}
      </div>
    </template>

    <template v-for="(stop, i) in RIBBON" :key="stop.station">
      <div
        class="rac-stop"
        :style="{ gridColumn: column(i), gridRow: mode === 'agenda' ? 6 : 1 }"
      >
        <span class="rac-stop-name">{{ stop.station }}</span>
        <span v-if="mode === 'artifacts'" class="rac-stop-detail">{{
          stop.artifact
        }}</span>
        <span
          v-else-if="mode === 'gates'"
          class="rac-stop-detail"
          :class="{ 'rac-stop-fixed': FIXED_GATES[stop.station] }"
          >{{ FIXED_GATES[stop.station] ?? "your call" }}</span
        >
      </div>
    </template>
    <div
      class="rac-stop-gate"
      :class="{ 'rac-stop-fixed': mode === 'gates' }"
      :style="{ gridRow: mode === 'agenda' ? 6 : 1 }"
      :title="'spec-reviewed'"
    >
      ‖
    </div>

    <div
      v-for="(t, i) in THREADS"
      :key="t.thread"
      class="rac-thread-bar"
      :class="{ 'rac-thread-bar-lit': mode === 'threads' }"
      :style="{ gridRow: (mode === 'agenda' ? 7 : 2) + i }"
    >
      <span class="rac-thread-name">{{ t.thread }}</span>
      <span class="rac-thread-role">{{
        mode === "threads" ? "every lesson lands here" : t.role
      }}</span>
    </div>
  </div>
</template>
