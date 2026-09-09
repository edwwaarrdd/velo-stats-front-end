<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Ride } from '../api/types'
import { formatDateTime, formatDistance, formatDuration, formatSpeed } from '../lib/format'
import WeatherBadge from './WeatherBadge.vue'

const props = defineProps<{ ride: Ride }>()
const router = useRouter()

function openDetail() {
  router.push({ name: 'ride-detail', params: { rideId: props.ride.ride_id } })
}

const statusStyles: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
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
        class="rounded-full px-2 py-0.5 text-xs font-medium ring-1"
        :class="statusStyles[ride.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'"
      >
        {{ ride.status }}
      </span>
    </div>

    <p class="mt-1 text-xs text-slate-500">{{ formatDateTime(ride.checkout_time) }}</p>

    <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
      <span>⏱ {{ formatDuration(ride.duration) }}</span>
      <span>📏 {{ formatDistance(ride.distance_meters) }}</span>
      <span>⚡ {{ formatSpeed(ride.speed_kmh) }}</span>
      <span v-if="ride.bike_number">🚲 #{{ ride.bike_number }}</span>
      <WeatherBadge :weather="ride.weather" />
    </div>
  </button>
</template>
