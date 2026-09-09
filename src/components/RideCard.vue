<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Ride } from '../api/types'
import { computed } from 'vue'
import type { RideBadge } from '../lib/insights'
import { expectedTimeComparison } from '../lib/insights'
import { formatDateTime, formatDistance, formatDuration, formatSeconds, formatSpeed } from '../lib/format'
import WeatherBadge from './WeatherBadge.vue'

const props = defineProps<{ ride: Ride; badge?: RideBadge }>()
const router = useRouter()

const vsExpected = computed(() => expectedTimeComparison(props.ride))

function openDetail() {
  router.push({ name: 'ride-detail', params: { rideId: props.ride.ride_id } })
}

const badgeStyles: Record<string, string> = {
  fastest: 'bg-amber-50 text-amber-700 ring-amber-200',
  slowest: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  longest: 'bg-purple-50 text-purple-700 ring-purple-200',
  shortest: 'bg-purple-50 text-purple-700 ring-purple-200',
  hardcore: 'bg-orange-50 text-orange-700 ring-orange-200',
  'round-trip': 'bg-sky-50 text-sky-700 ring-sky-200',
}
</script>

<template>
  <button
    type="button"
    class="w-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-slate-300"
    @click="openDetail"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-sm font-medium text-slate-900">
        <span>{{ ride.origin_station ?? 'Unknown station' }}</span>
        <span class="text-slate-400">→</span>
        <span>{{ ride.destination_station ?? 'Unknown station' }}</span>
      </div>
      <span
        v-if="ride.status !== 'Completed'"
        class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
      >
        {{ ride.status }}
      </span>
      <span
        v-else-if="badge"
        class="rounded-full px-2 py-0.5 text-xs font-medium ring-1"
        :class="badgeStyles[badge.key]"
      >
        {{ badge.icon }} {{ badge.label }}
      </span>
      <span v-else class="rounded-full px-2 py-0.5 text-xs font-medium ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200">
        Completed
      </span>
    </div>

    <p class="mt-1 text-xs text-slate-500">{{ formatDateTime(ride.checkout_time) }}</p>

    <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
      <span>⏱ {{ formatDuration(ride.duration) }}</span>
      <span>📏 {{ formatDistance(ride.distance_meters) }}</span>
      <span>⚡ {{ formatSpeed(ride.speed_kmh) }}</span>
      <span
        v-if="vsExpected"
        :class="vsExpected.faster ? 'text-emerald-600' : 'text-rose-600'"
        :title="`Router expected ${formatSeconds(vsExpected.expectedSeconds)} for this route`"
      >
        {{ vsExpected.faster ? '🏁' : '🐢' }}
        {{ formatSeconds(Math.abs(vsExpected.deltaSeconds)) }}
        {{ vsExpected.faster ? 'faster' : 'slower' }} than expected
      </span>
      <span v-if="ride.bike_number">🚲 #{{ ride.bike_number }}</span>
      <WeatherBadge :weather="ride.weather" />
    </div>
  </button>
</template>
