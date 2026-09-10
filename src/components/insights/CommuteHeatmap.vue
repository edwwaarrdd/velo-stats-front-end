<script setup lang="ts">
import { computed } from 'vue';
import type { Ride } from '../../api/types';
import { commuteSignature, dayLabel, fullDayLabel } from '../../lib/insights';

const props = defineProps<{ rides: Ride[] }>();

const signature = computed(() => commuteSignature(props.rides));
const days = [1, 2, 3, 4, 5, 6, 0];
const hourTicks = [0, 4, 8, 12, 16, 20];

function cellFor(day: number, hour: number) {
  return signature.value.cells.find((cell) => cell.day === day && cell.hour === hour);
}

function opacity(count: number): number {
  if (signature.value.maxCount === 0) return 0;
  return 0.12 + (count / signature.value.maxCount) * 0.88;
}

const peakLabel = computed(() => {
  const peak = signature.value.peak;
  if (!peak) return null;
  const hourLabel = `${String(peak.hour).padStart(2, '0')}:00`;
  return `${fullDayLabel(peak.day)} around ${hourLabel} (${peak.count} ride${peak.count === 1 ? '' : 's'})`;
});
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Commute signature</h2>
    <p class="mt-1 text-sm text-slate-500">
      <span v-if="peakLabel"
        >Your busiest slot: <span class="font-medium text-slate-700">{{ peakLabel }}</span
        >.</span
      >
      Weekday rides: {{ signature.weekdayRides }} · Weekend rides: {{ signature.weekendRides }}
    </p>

    <div class="mt-4 overflow-x-auto">
      <div class="inline-block min-w-full">
        <div class="ml-8 flex text-[10px] text-slate-400">
          <span v-for="hour in 24" :key="hour" class="w-4 text-center">
            {{ hourTicks.includes(hour - 1) ? hour - 1 : '' }}
          </span>
        </div>
        <div v-for="day in days" :key="day" class="flex items-center">
          <span class="w-8 text-xs text-slate-400">{{ dayLabel(day) }}</span>
          <div class="flex">
            <div
              v-for="hour in 24"
              :key="hour"
              class="m-px h-4 w-4 rounded-sm bg-sky-600"
              :style="{ opacity: opacity(cellFor(day, hour - 1)?.count ?? 0) }"
              :title="`${dayLabel(day)} ${String(hour - 1).padStart(2, '0')}:00 — ${cellFor(day, hour - 1)?.count ?? 0} rides`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
