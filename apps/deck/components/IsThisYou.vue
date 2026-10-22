<script setup lang="ts">
// "Is this you?": each group's least-certain claim, and its correction once noted. From retrospective.json on the data branch.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { isThisYouCards } from "../src/live/retro";
import IsThisYouView from "./IsThisYouView.vue";

const live = useLive();
const cards = computed(() => isThisYouCards(live.value?.docs.retrospective));
</script>

<template>
  <IsThisYouView :cards="cards" />
</template>
