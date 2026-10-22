<script setup lang="ts">
// Renders how each group drove its agent, a column each, in the group's own words where it has them.
import type { DrivingColumn } from "../src/live/retro";

defineProps<{ columns: DrivingColumn[] }>();
</script>

<template>
  <div
    v-if="columns.length"
    class="rac-wall"
    :style="{ '--rac-cols': columns.length }"
  >
    <article
      v-for="c in columns"
      :key="c.group"
      class="rac-card rac-retro-card rac-driving"
    >
      <header class="rac-wall-head">
        <span class="rac-wall-name">{{ c.label }}</span>
      </header>
      <p class="rac-driving-tool">{{ c.tool }} · {{ c.tests }}</p>
      <template v-if="c.skills.length">
        <h3>Skills that ran</h3>
        <p class="rac-driving-skills">{{ c.skills.join(" · ") }}</p>
      </template>
      <template v-if="c.corrections.length">
        <h3>Where it corrected its agent</h3>
        <ul>
          <li v-for="(x, i) in c.corrections" :key="i">{{ x }}</li>
        </ul>
      </template>
      <template v-if="c.steering">
        <h3>At the one computer</h3>
        <p>{{ c.steering }}</p>
      </template>
      <template v-if="c.said.length">
        <h3>Said by the group</h3>
        <ul class="rac-said">
          <li v-for="(x, i) in c.said" :key="i">{{ x }}</li>
        </ul>
      </template>
      <template v-if="c.anecdotes.length">
        <h3>About the tool</h3>
        <ul>
          <li v-for="(x, i) in c.anecdotes" :key="i">{{ x }}</li>
        </ul>
      </template>
    </article>
  </div>
  <p v-else class="rac-wall-empty">
    How each group drove its agent appears here once the coaches publish the
    retrospective.
  </p>
</template>
