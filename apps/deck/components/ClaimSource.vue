<script setup lang="ts">
// Under a retrospective claim: how sure the synthesis is, and where it comes from. Never the quote itself.
import type { Provenance } from "../src/live/retro";

defineProps<{ of: Provenance }>();
</script>

<template>
  <p class="rac-claim-source" :class="`rac-sure-${of.confidence}`">
    {{ of.confidence }} confidence<template v-if="of.sources.length">
      · {{ of.sources.join(" · ") }}</template
    >
  </p>
</template>
