<script setup lang="ts">
// The library list, live during Day 2's lab and show and tell: every lab PR into main, as the script last saw it.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { libraryList } from "../src/live/library";
import LibraryListView from "./LibraryListView.vue";

const live = useLive();
const list = computed(() => libraryList(live.value?.docs.library));
</script>

<template>
  <LibraryListView :list="list" />
</template>
