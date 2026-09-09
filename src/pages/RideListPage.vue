<script setup lang="ts">
import { useCost } from '../composables/useCost'
import { useRides } from '../composables/useRides'
import { useSummary } from '../composables/useSummary'
import RideList from '../components/RideList.vue'
import SummaryHeader from '../components/SummaryHeader.vue'

const { rides, loading: ridesLoading, error: ridesError } = useRides()
const { summary, loading: summaryLoading } = useSummary()
const { cost, loading: costLoading } = useCost()
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <SummaryHeader :summary="summary" :cost="cost" :loading="summaryLoading || costLoading" />

    <h2 class="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Rides</h2>
    <RideList :rides="rides" :loading="ridesLoading" :error="ridesError" />
  </div>
</template>
