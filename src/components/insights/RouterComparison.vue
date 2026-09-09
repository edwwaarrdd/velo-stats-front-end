<script setup lang="ts">
import { computed } from 'vue'
import type { Ride } from '../../api/types'
import { expectedTimeStats } from '../../lib/insights'
import { formatSeconds } from '../../lib/format'

const props = defineProps<{ rides: Ride[] }>()

const stats = computed(() => expectedTimeStats(props.rides))
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Versus the router</h2>
    <p class="mt-1 text-sm text-slate-500">
      Your dock-to-dock time against the ride time OSRM predicts (of {{ stats.ridesCompared }} with a cached route).
    </p>

    <div class="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
      <div>
        <p class="text-2xl font-semibold text-emerald-600">{{ stats.fasterRides }}</p>
        <p class="text-xs text-slate-500">🏁 faster</p>
        <p class="text-xs text-slate-400">{{ stats.fasterPercentage.toFixed(1) }}%</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-rose-600">{{ stats.slowerRides }}</p>
        <p class="text-xs text-slate-500">🐢 slower</p>
        <p class="text-xs text-slate-400">{{ (100 - stats.fasterPercentage).toFixed(1) }}%</p>
      </div>
      <div>
        <p
          class="text-2xl font-semibold"
          :class="stats.averageDeltaSeconds < 0 ? 'text-emerald-600' : 'text-rose-600'"
        >
          {{ formatSeconds(Math.abs(stats.averageDeltaSeconds)) }}
        </p>
        <p class="text-xs text-slate-500">
          ⏱ average {{ stats.averageDeltaSeconds < 0 ? 'gain' : 'loss' }}
        </p>
      </div>
    </div>

    <p class="mt-4 text-xs text-slate-400">
      The router assumes an uninterrupted ride, so traffic lights, junctions and docking the bike all
      count against you here.
    </p>
  </div>
</template>
