<script setup lang="ts">
import { computed } from 'vue'
import type { Ride } from '../../api/types'
import { roundTripStats, topStationPairs, topStations } from '../../lib/insights'

const props = defineProps<{ rides: Ride[] }>()

const stations = computed(() => topStations(props.rides, 5))
const pairs = computed(() => topStationPairs(props.rides, 5))
const roundTrips = computed(() => roundTripStats(props.rides))
const maxStationCount = computed(() => stations.value[0]?.count ?? 1)
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Stations</h2>

    <div class="mt-3 space-y-2">
      <div v-for="station in stations" :key="station.code" class="text-sm">
        <div class="flex items-center justify-between">
          <span class="text-slate-700">{{ station.name }}</span>
          <span class="text-slate-400">{{ station.count }}</span>
        </div>
        <div class="mt-0.5 h-1.5 rounded-full bg-slate-100">
          <div
            class="h-1.5 rounded-full bg-sky-500"
            :style="{ width: `${(station.count / maxStationCount) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <h3 class="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Top routes</h3>
    <ul class="mt-2 space-y-1.5 text-sm text-slate-600">
      <li v-for="pair in pairs" :key="`${pair.origin}-${pair.destination}`" class="flex items-center justify-between gap-2">
        <span class="truncate">{{ pair.origin }} <span class="text-slate-400">→</span> {{ pair.destination }}</span>
        <span class="shrink-0 text-slate-400">{{ pair.count }}×</span>
      </li>
    </ul>

    <div class="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
      <span class="font-medium text-slate-800">{{ roundTrips.count }}</span> round trip{{ roundTrips.count === 1 ? '' : 's' }}
      ({{ roundTrips.percentage.toFixed(1) }}% of all rides) — same station in and out.
      <span v-if="roundTrips.topStations.length" class="text-slate-400">
        Mostly at {{ roundTrips.topStations.map((s) => s.name).join(', ') }}.
      </span>
    </div>
  </div>
</template>
