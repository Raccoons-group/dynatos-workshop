<script setup lang="ts">
// Renders a row per lab PR: name, fix level, what it catches, the tools it passed in, open or merged. No names.
// Strings go through {{ }} only.
import type { LibraryList } from "../src/live/library";

defineProps<{ list: LibraryList }>();
</script>

<template>
  <div v-if="list.rows.length" class="rac-library">
    <p class="rac-exhibit-label">Lab PRs into main · {{ list.updated }}</p>
    <div class="rac-library-grid">
      <span class="rac-library-head">#</span>
      <span class="rac-library-head">Name</span>
      <span class="rac-library-head">Fix level</span>
      <span class="rac-library-head">What it catches</span>
      <span class="rac-library-head">Tools passed</span>
      <span class="rac-library-head" />
      <template v-for="row in list.rows" :key="row.pr">
        <span class="rac-pr-number">#{{ row.pr }}</span>
        <span class="rac-library-name">{{ row.name }}</span>
        <span class="rac-library-level">{{ row.fixLevel }}</span>
        <span class="rac-library-catches">{{ row.catches }}</span>
        <ul v-if="row.tools" class="rac-threads" aria-label="Tools passed">
          <li
            v-for="tool in row.tools"
            :key="tool.name"
            :class="{ 'rac-thread-lit': tool.passed }"
          >
            {{ tool.name }}
          </li>
        </ul>
        <span v-else class="rac-none">no trigger tests</span>
        <span class="rac-status" :class="`rac-pr-${row.state}`">{{
          row.state
        }}</span>
      </template>
    </div>
  </div>
  <p v-else class="rac-wall-empty">
    The list fills as each pair opens its PR into main.
  </p>
</template>
