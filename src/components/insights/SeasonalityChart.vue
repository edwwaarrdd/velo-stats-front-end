<script setup lang="ts">
import { computed } from 'vue'
import type { Ride } from '../../api/types'
import { bestMonth, monthlyDistance, winterStats } from '../../lib/insights'
import { formatDistance, formatDuration } from '../../lib/format'

const props = defineProps<{ rides: Ride[] }>()

const CHART_HEIGHT_PX = 128

const months = computed(() => monthlyDistance(props.rides))
const best = computed(() => bestMonth(months.value))
const winter = computed(() => winterStats(props.rides))
const maxMeters = computed(() => Math.max(...months.value.map((m) => m.totalMeters), 1))

function barHeightPx(meters: number): number {
  if (meters <= 0) return 0
  return Math.max((meters / maxMeters.value) * CHART_HEIGHT_PX, 2)
}
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Seasonality</h2>
    <p class="mt-1 text-sm text-slate-500">Distance ridden by month.</p>

    <div class="mt-4 flex h-32 items-end gap-1 overflow-x-auto">
      <div
        v-for="month in months"
        :key="month.key"
        class="min-w-[10px] flex-1 rounded-t bg-sky-500"
        :class="{ 'bg-emerald-500': best && month.key === best.key }"
        :style="{ height: `${barHeightPx(month.totalMeters)}px` }"
        :title="`${month.label}: ${formatDistance(month.totalMeters)} over ${month.rideCount} rides`"
      />
    </div>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        <span class="font-medium">Best month ever:</span>
        <span v-if="best"> {{ best.label }} — {{ formatDistance(best.totalMeters) }} over {{ best.rideCount }} rides.</span>
      </div>
      <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        <span class="font-medium text-slate-800">Belgian winter (Dec–Feb):</span>
        {{ winter.rideCount }} rides, {{ formatDistance(winter.totalMeters) }}, {{ formatDuration(winter.totalDuration) }}
        ({{ winter.percentageOfRides.toFixed(1) }}% of all rides).
      </div>
    </div>
  </div>
</template>
