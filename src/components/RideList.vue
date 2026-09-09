<script setup lang="ts">
import { computed } from 'vue'
import type { Ride } from '../api/types'
import { computeRideBadges } from '../lib/insights'
import RideCard from './RideCard.vue'

const props = defineProps<{
  rides: Ride[]
  loading: boolean
  error: string | null
}>()

const badges = computed(() => computeRideBadges(props.rides))
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <p v-else-if="error" class="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
      Couldn't load rides: {{ error }}
    </p>

    <p v-else-if="rides.length === 0" class="rounded-xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
      No rides recorded yet.
    </p>

    <div v-else class="space-y-3">
      <RideCard v-for="ride in rides" :key="ride.ride_id" :ride="ride" :badge="badges.get(ride.ride_id)" />
    </div>
  </div>
</template>
