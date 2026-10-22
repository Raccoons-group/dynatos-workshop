<script setup lang="ts">
// A repo file, shown as the file it is: its path, then its first lines. Used for the root AGENTS.md next to the
// template (slide 17) and the CI guard (slide 59).
import { computed } from "vue";

import { repoFile } from "../src/exhibits/files";
import { excerpt } from "../src/exhibits/parse";

const props = withDefaults(defineProps<{ path: string; lines?: number }>(), {
  lines: 30,
});

const file = computed(() => excerpt(repoFile(props.path), props.lines));
</script>

<template>
  <figure class="rac-exhibit rac-file">
    <figcaption class="rac-exhibit-label">{{ path }}</figcaption>
    <pre><code>{{ file.lines.join("\n") }}</code></pre>
    <p v-if="file.more" class="rac-file-more">… {{ file.more }} more lines</p>
  </figure>
</template>
