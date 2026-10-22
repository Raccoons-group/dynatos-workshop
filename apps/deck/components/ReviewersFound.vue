<script setup lang="ts">
// "What the reviewers found", live during the review block.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { reviewCards } from "../src/live/reviews";
import ReviewersFoundView from "./ReviewersFoundView.vue";

const live = useLive();
const cards = computed(() =>
  reviewCards(Object.values(live.value?.groups ?? {})),
);
</script>

<template>
  <ReviewersFoundView :cards="cards" />
</template>
