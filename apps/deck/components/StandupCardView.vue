<script setup lang="ts">
// Renders one group's stand-up card: its mini ribbon enlarged, then the route it took and what it learned.
import type { StandupCard } from "../src/live/standup";

defineProps<{ card: StandupCard }>();
</script>

<template>
  <article class="rac-card rac-standup">
    <header class="rac-wall-head">
      <span class="rac-wall-name">{{ card.label }}</span>
      <span class="rac-standup-phase">{{ card.phase }}</span>
    </header>

    <ol class="rac-ribbon" aria-label="Phase">
      <template v-for="(station, i) in card.stations" :key="station.name">
        <li
          v-if="i === 2"
          class="rac-gate"
          :class="{ 'rac-gate-passed': card.gatePassed }"
        >
          ‖
        </li>
        <li class="rac-station" :class="`rac-station-${station.state}`">
          {{ station.name }}
        </li>
      </template>
    </ol>
    <ul class="rac-threads" aria-label="Threads">
      <li :class="{ 'rac-thread-lit': card.threads.context }">context</li>
      <li :class="{ 'rac-thread-lit': card.threads.skills }">skills</li>
      <li :class="{ 'rac-thread-lit': card.threads.checks }">checks</li>
    </ul>

    <div class="rac-standup-body">
      <section>
        <h3>Slices · {{ card.shipped }}</h3>
        <ul class="rac-standup-list">
          <li v-for="(slice, i) in card.slices" :key="i">
            <span class="rac-status" :class="`rac-status-${slice.status}`">{{
              slice.status
            }}</span>
            {{ slice.name }}
          </li>
        </ul>
        <h3>Acceptance examples · {{ card.covered }}</h3>
        <ul class="rac-examples">
          <li
            v-for="(example, i) in card.examples"
            :key="i"
            :class="{ 'rac-example-tested': example.inTest }"
          >
            {{ example.example }}
          </li>
        </ul>
      </section>

      <section>
        <h3>First green CI</h3>
        <p class="rac-standup-value">{{ card.firstGreen ?? "not yet" }}</p>
        <h3>Skills written</h3>
        <ul class="rac-standup-list">
          <li v-for="skill in card.skillsWritten" :key="skill">
            {{ skill }}
          </li>
          <li v-if="!card.skillsWritten.length" class="rac-none">none yet</li>
        </ul>
        <h3>What the agent got wrong</h3>
        <ul class="rac-standup-list">
          <li v-for="(wrong, i) in card.agentGotWrong" :key="i">
            {{ wrong.item }}
            <span v-if="wrong.twice" class="rac-twice">twice</span>
          </li>
          <li v-if="!card.agentGotWrong.length" class="rac-none">
            nothing noted yet
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>
