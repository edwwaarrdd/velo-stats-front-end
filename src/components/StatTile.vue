<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  hint?: string;
  accent?: 'default' | 'positive';
}>();
</script>

<template>
  <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 lg:p-4">
    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ label }}</p>
    <p
      class="mt-1 whitespace-nowrap text-xl font-semibold lg:text-2xl"
      :class="accent === 'positive' ? 'text-emerald-600' : 'text-slate-900'"
    >
      {{ value }}
    </p>
    <p v-if="hint" class="mt-1 text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>
