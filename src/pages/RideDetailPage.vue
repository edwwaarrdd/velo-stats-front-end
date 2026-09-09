<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRides } from '../composables/useRides'
import StatTile from '../components/StatTile.vue'
import RideRouteMap from '../components/RideRouteMap.vue'
import {
  COLD_THRESHOLD_C,
  HOT_THRESHOLD_C,
  expectedTimeComparison,
  rideHardcoreTags,
} from '../lib/insights'
import {
  formatDate,
  formatDistance,
  formatDuration,
  formatSeconds,
  formatSpeed,
  formatTime,
  weatherCodeInfo,
} from '../lib/format'

const route = useRoute()
const { rideById, loading, error } = useRides()

const rideId = computed(() => Number(route.params.rideId))
const ride = computed(() => rideById.value.get(rideId.value) ?? null)

// Derived from the exact ride time, not the `duration` field, which truncates
// to whole minutes and so flatters the pace.
const pace = computed(() => {
  const r = ride.value
  if (!r || !r.distance_meters || !r.actual_duration_seconds) return null
  return r.actual_duration_seconds / 60 / (r.distance_meters / 1000)
})

const vsExpected = computed(() => (ride.value ? expectedTimeComparison(ride.value) : null))

const weatherInfo = computed(() => weatherCodeInfo(ride.value?.weather?.weather_code ?? null))
const hardcore = computed(() => (ride.value ? rideHardcoreTags(ride.value) : null))
const hardcoreReasons = computed(() => {
  if (!hardcore.value) return []
  const reasons: string[] = []
  if (hardcore.value.rain) reasons.push('rode in rain')
  if (hardcore.value.cold) reasons.push(`rode below ${COLD_THRESHOLD_C}°C`)
  if (hardcore.value.hot) reasons.push(`rode above ${HOT_THRESHOLD_C}°C`)
  return reasons
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-8">
    <router-link to="/" class="text-sm font-medium text-sky-600 hover:text-sky-700">← Back to all rides</router-link>

    <div v-if="loading" class="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />

    <p v-else-if="error" class="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
      Couldn't load ride: {{ error }}
    </p>

    <p v-else-if="!ride" class="mt-6 rounded-xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
      Ride not found.
    </p>

    <div v-else class="mt-4">
      <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div class="flex items-center justify-between gap-2">
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {{ ride.status }}
          </span>
          <span v-if="ride.bike_number" class="text-xs text-slate-400">Bike #{{ ride.bike_number }}</span>
        </div>

        <div class="mt-3 flex items-center gap-3 text-lg font-semibold text-slate-900">
          <span>{{ ride.origin_station ?? 'Unknown station' }}</span>
          <span class="text-slate-400">→</span>
          <span>{{ ride.destination_station ?? 'Unknown station' }}</span>
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-500">
          <dt>Checked out</dt>
          <dd class="text-right text-slate-700">{{ formatDate(ride.checkout_time) }} · {{ formatTime(ride.checkout_time) }}</dd>
          <dt>Checked in</dt>
          <dd class="text-right text-slate-700">{{ formatDate(ride.checkin_time) }} · {{ formatTime(ride.checkin_time) }}</dd>
          <dt v-if="ride.origin_station_code">Origin station code</dt>
          <dd v-if="ride.origin_station_code" class="text-right text-slate-700">{{ ride.origin_station_code }}</dd>
          <dt v-if="ride.destination_station_code">Destination station code</dt>
          <dd v-if="ride.destination_station_code" class="text-right text-slate-700">{{ ride.destination_station_code }}</dd>
        </dl>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Duration" :value="formatDuration(ride.duration)" />
        <StatTile label="Distance" :value="formatDistance(ride.distance_meters)" />
        <StatTile label="Speed" :value="formatSpeed(ride.speed_kmh)" />
        <StatTile label="Pace" :value="pace ? `${pace.toFixed(1)} min/km` : '—'" />
      </div>

      <div class="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Versus the expected ride time</h2>

        <p v-if="!vsExpected" class="mt-3 text-sm text-slate-400">
          No cached route for this trip, so there is nothing to compare against.
        </p>

        <div v-else>
          <p
            class="mt-2 text-2xl font-semibold"
            :class="vsExpected.faster ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ vsExpected.faster ? '🏁' : '🐢' }}
            {{ formatSeconds(Math.abs(vsExpected.deltaSeconds)) }}
            {{ vsExpected.faster ? 'faster' : 'slower' }}
          </p>
          <p class="text-sm text-slate-500">
            {{ Math.abs(vsExpected.percentage).toFixed(1) }}%
            {{ vsExpected.faster ? 'under' : 'over' }} what the router predicts for this route.
          </p>

          <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt class="text-slate-400">Expected</dt>
              <dd class="text-slate-700">{{ formatSeconds(vsExpected.expectedSeconds) }}</dd>
            </div>
            <div>
              <dt class="text-slate-400">Actual</dt>
              <dd class="text-slate-700">{{ formatSeconds(vsExpected.actualSeconds) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="mt-4">
        <RideRouteMap :ride="ride" />
      </div>

      <div class="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Weather</h2>
          <span
            v-if="hardcore?.isHardcore"
            class="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200"
            :title="`Hardcore ride: ${hardcoreReasons.join(', ')}`"
          >
            💪 Hardcore ride
          </span>
        </div>

        <div v-if="!ride.weather" class="mt-3 text-sm text-slate-400">
          No weather data cached for this trip.
        </div>

        <div v-else>
          <div class="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <span>{{ weatherInfo.icon }}</span>
            <span>{{ ride.weather.temperature_c?.toFixed(1) ?? '—' }}°C</span>
            <span class="text-sm font-normal text-slate-400">feels like {{ ride.weather.apparent_temperature_c?.toFixed(1) ?? '—' }}°C</span>
          </div>
          <p class="text-sm text-slate-500">{{ weatherInfo.label }} · observed {{ formatTime(ride.weather.observed_at) }}</p>
          <p v-if="hardcore?.isHardcore" class="mt-1 text-sm text-orange-600">
            You {{ hardcoreReasons.join(' and ') }} on this one.
          </p>

          <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt class="text-slate-400">Precipitation</dt>
              <dd class="text-slate-700">{{ ride.weather.precipitation_mm ?? '—' }} mm</dd>
            </div>
            <div>
              <dt class="text-slate-400">Rain</dt>
              <dd class="text-slate-700">{{ ride.weather.rain_mm ?? '—' }} mm</dd>
            </div>
            <div>
              <dt class="text-slate-400">Snowfall</dt>
              <dd class="text-slate-700">{{ ride.weather.snowfall_cm ?? '—' }} cm</dd>
            </div>
            <div>
              <dt class="text-slate-400">Wind speed</dt>
              <dd class="text-slate-700">{{ ride.weather.wind_speed_kmh ?? '—' }} km/h</dd>
            </div>
            <div>
              <dt class="text-slate-400">Wind gusts</dt>
              <dd class="text-slate-700">{{ ride.weather.wind_gusts_kmh ?? '—' }} km/h</dd>
            </div>
            <div>
              <dt class="text-slate-400">Wind direction</dt>
              <dd class="text-slate-700">{{ ride.weather.wind_direction_degrees ?? '—' }}°</dd>
            </div>
            <div>
              <dt class="text-slate-400">Humidity</dt>
              <dd class="text-slate-700">{{ ride.weather.relative_humidity_percent ?? '—' }}%</dd>
            </div>
            <div>
              <dt class="text-slate-400">Cloud cover</dt>
              <dd class="text-slate-700">{{ ride.weather.cloud_cover_percent ?? '—' }}%</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
