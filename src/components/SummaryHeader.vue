<script setup lang="ts">
import type { RideCost, RideSummary } from '../api/types';
import { formatDistance, formatDuration, formatEur } from '../lib/format';
import StatTile from './StatTile.vue';

defineProps<{
  summary: RideSummary | null;
  cost: RideCost | null;
  loading: boolean;
}>();

function averageSpeed(summary: RideSummary): number | null {
  if (!summary.total_distance_meters || !summary.total_duration) return null;
  return summary.total_distance_meters / 1000 / (summary.total_duration / 60);
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h1 class="text-2xl font-bold text-slate-900">🚲 Velo Stats</h1>
      <router-link to="/insights" class="text-sm font-medium text-sky-600 hover:text-sky-700"
        >📊 View insights →</router-link
      >
    </div>
    <p class="mt-1 text-sm text-slate-500">A look back at every ride, one summary tile at a time.</p>

    <div v-if="loading" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="n in 6" :key="n" class="h-20 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <div v-else class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatTile label="Total rides" :value="String(summary?.total_rides ?? 0)" />
      <StatTile label="Total time riding" :value="formatDuration(summary?.total_duration ?? null)" />
      <StatTile label="Total distance" :value="formatDistance(summary?.total_distance_meters ?? null)" />
      <StatTile
        label="Average speed"
        :value="summary && averageSpeed(summary) !== null ? `${averageSpeed(summary)!.toFixed(1)} km/h` : '—'"
      />
      <StatTile label="Cost per ride" :value="formatEur(cost?.cost_per_ride_eur ?? null)" />
      <StatTile
        label="Saved vs day passes"
        :value="formatEur(cost?.money_saved_vs_day_passes_eur ?? null)"
        accent="positive"
      />
    </div>
  </div>
</template>
