<script setup lang="ts">
// The wayfinder map this workshop was planned on (slides 5 and 31): every decision, what's still in the fog,
// and what we left out on purpose. Read from .scratch/workshop/map.md.
import { repoFile } from "../src/exhibits/files";
import { mapExhibit } from "../src/exhibits/parse";

const map = mapExhibit(repoFile(".scratch/workshop/map.md"));
</script>

<template>
  <div class="rac-exhibit rac-map">
    <section>
      <p class="rac-exhibit-label">
        Decisions so far · {{ map.decisions.length }} tickets
      </p>
      <ol class="rac-map-decisions">
        <li v-for="d in map.decisions" :key="d.title">{{ d.title }}</li>
      </ol>
    </section>
    <section>
      <p class="rac-exhibit-label">Still in the fog</p>
      <ul class="rac-map-list">
        <li v-for="line in map.open" :key="line">{{ line }}</li>
      </ul>
      <p class="rac-exhibit-label">Left out on purpose</p>
      <ul class="rac-map-list">
        <li v-for="line in map.outOfScope" :key="line">{{ line }}</li>
      </ul>
    </section>
  </div>
</template>
