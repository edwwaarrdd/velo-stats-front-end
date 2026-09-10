<script setup lang="ts">
import { computed } from 'vue';
import type { Ride } from '../../api/types';
import { hardcoreStats } from '../../lib/insights';

const props = defineProps<{ rides: Ride[] }>();

const stats = computed(() => hardcoreStats(props.rides));
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Hardcore factor</h2>
    <p class="mt-1 text-sm text-slate-500">
      Rides in less-than-ideal conditions (of {{ stats.totalWithWeather }} with weather data).
    </p>

    <div class="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
      <div>
        <p class="text-2xl font-semibold text-slate-900">{{ stats.rainRides }}</p>
        <p class="text-xs text-slate-500">🌧️ in rain</p>
        <p class="text-xs text-slate-400">{{ stats.rainPercentage.toFixed(1) }}%</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-slate-900">{{ stats.coldRides }}</p>
        <p class="text-xs text-slate-500">🥶 below 5°C</p>
        <p class="text-xs text-slate-400">{{ stats.coldPercentage.toFixed(1) }}%</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-slate-900">{{ stats.hotRides }}</p>
        <p class="text-xs text-slate-500">🥵 above 30°C</p>
        <p class="text-xs text-slate-400">{{ stats.hotPercentage.toFixed(1) }}%</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-emerald-600">{{ stats.hardcorePercentage.toFixed(0) }}%</p>
        <p class="text-xs text-slate-500">💪 hardcore rides</p>
      </div>
    </div>
  </div>
</template>
