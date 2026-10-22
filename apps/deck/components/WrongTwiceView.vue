<script setup lang="ts">
// Renders the "wrong twice" shortlist in three columns, one per thread, with where a fix could live.
import type { ShortlistColumn } from "../src/live/retro";

defineProps<{ columns: ShortlistColumn[] }>();
</script>

<template>
  <div
    v-if="columns.some((c) => c.items.length)"
    class="rac-wall"
    style="--rac-cols: 3"
  >
    <section
      v-for="c in columns"
      :key="c.thread"
      class="rac-card rac-retro-card"
    >
      <header>
        <span class="rac-wall-name">{{ c.title }}</span>
        <p class="rac-claim-source">a fix could be {{ c.where }}</p>
      </header>
      <ul class="rac-shortlist">
        <li v-for="(x, i) in c.items" :key="i">
          {{ x.item }}
          <span class="rac-claim-source">{{ x.groups.join(", ") }}</span>
        </li>
        <li v-if="!c.items.length" class="rac-none">nothing twice</li>
      </ul>
    </section>
  </div>
  <p v-else class="rac-wall-empty">
    The shortlist appears here once the coaches publish the retrospective.
  </p>
</template>
