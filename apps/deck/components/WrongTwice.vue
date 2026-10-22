<script setup lang="ts">
// The hand-off to the skill lab: what went wrong twice, by thread. From retrospective.json on the data branch.
import { computed } from "vue";

import { useLive } from "../composables/useLive";
import { shortlistByThread } from "../src/live/retro";
import WrongTwiceView from "./WrongTwiceView.vue";

const live = useLive();
const columns = computed(() =>
  shortlistByThread(live.value?.docs.retrospective),
);
</script>

<template>
  <WrongTwiceView :columns="columns" />
</template>
