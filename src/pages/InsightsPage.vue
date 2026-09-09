<script setup lang="ts">
import { useRides } from '../composables/useRides'
import CommuteHeatmap from '../components/insights/CommuteHeatmap.vue'
import StationLeaderboard from '../components/insights/StationLeaderboard.vue'
import SeasonalityChart from '../components/insights/SeasonalityChart.vue'
import HardcoreFactor from '../components/insights/HardcoreFactor.vue'
import BikeStats from '../components/insights/BikeStats.vue'

const { rides, loading, error } = useRides()
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <router-link to="/" class="text-sm font-medium text-sky-600 hover:text-sky-700">← Back to all rides</router-link>

    <h1 class="mt-3 text-2xl font-bold text-slate-900">📊 Insights</h1>
    <p class="mt-1 text-sm text-slate-500">Patterns hiding in your ride history.</p>

    <div v-if="loading" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div v-for="n in 5" :key="n" class="h-40 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <p v-else-if="error" class="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
      Couldn't load rides: {{ error }}
    </p>

    <div v-else class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <CommuteHeatmap :rides="rides" />
      </div>
      <StationLeaderboard :rides="rides" />
      <SeasonalityChart :rides="rides" />
      <HardcoreFactor :rides="rides" />
      <BikeStats :rides="rides" />
    </div>
  </div>
</template>
