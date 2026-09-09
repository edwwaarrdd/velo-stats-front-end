<script setup lang="ts">
import type { Weather } from '../api/types'
import { weatherCodeInfo } from '../lib/format'

const props = defineProps<{
  weather: Weather | null
}>()

const info = weatherCodeInfo(props.weather?.weather_code ?? null)
</script>

<template>
  <span
    v-if="weather"
    class="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200"
    :title="info.label"
  >
    <span>{{ info.icon }}</span>
    <span>{{ weather.temperature_c?.toFixed(1) ?? '—' }}°C</span>
  </span>
  <span
    v-else
    class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-200"
  >
    No weather data
  </span>
</template>
