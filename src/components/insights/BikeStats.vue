<script setup lang="ts">
import { computed } from 'vue';
import type { Ride } from '../../api/types';
import { bikeStats } from '../../lib/insights';

const props = defineProps<{ rides: Ride[] }>();

const stats = computed(() => bikeStats(props.rides));
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Bikes</h2>

    <div class="mt-3 grid grid-cols-2 gap-3 text-center">
      <div>
        <p class="text-2xl font-semibold text-slate-900">{{ stats.uniqueBikes }}</p>
        <p class="text-xs text-slate-500">unique bikes ridden</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-slate-900">{{ stats.repeatedBikes }}</p>
        <p class="text-xs text-slate-500">ridden more than once</p>
      </div>
    </div>

    <p v-if="stats.mostRidden" class="mt-3 text-sm text-slate-600">
      Your most-ridden bike is <span class="font-medium text-slate-800">#{{ stats.mostRidden.bike }}</span
      >, {{ stats.mostRidden.count }} times.
    </p>

    <ul v-if="stats.topBikes.length > 1" class="mt-3 space-y-1 text-sm text-slate-500">
      <li
        v-for="bike in stats.topBikes.slice(1).filter((b) => b.count > 1)"
        :key="bike.bike"
        class="flex justify-between"
      >
        <span>#{{ bike.bike }}</span>
        <span>{{ bike.count }}×</span>
      </li>
    </ul>
  </div>
</template>
